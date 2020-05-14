var Bot = require('nodemw')
var async = require('async')
var cheerio = require('cheerio')
var S = require('string')
var MongoClient = require('mongodb').MongoClient

var config = require('./config')
var utils = require('./utils')

// Create a client with configuration
var client = new Bot({
  server: 'it.wikipedia.org', // host name of MediaWiki-powered site
  path: '/w', // path to api.php script
  debug: false // is more verbose when set to true
})

// Connection URL
var mongodb = config.mongodb

var url = 'mongodb://'

if (mongodb.auth) {
  url += mongodb.username + ':' + mongodb.password + '@'
}

url += mongodb.server + ':' + mongodb.port + '/' + mongodb.database

MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Error connecting to server')
    process.exit(1)
  } else {
    console.log('Connected correctly to server')
  }

  var collection = db.collection(mongodb.collection)
  collection.ensureIndex('nome', function (err) {
    if (err) {
      console.error('Error creating the index.')
    }
  })

  async.waterfall([
    function (callback) {
      client.getPagesByPrefix('Comuni_d\'Italia_(', function (err, data) {
        // error handling
        if (err) {
          console.error(err)
        } else {
          callback(null, data)
        }
      })
    },
    function (data, callback) {
      // Iterate over lists
      async.each(data, function (comuniList, seriesCallback) {
        var title = comuniList.title
        var params = {
          action: 'parse',
          page: title,
          format: 'json',
          prop: 'text'
        }

        // Find all comuni
        client.api.call(params, function (err, info, next, data) {
          // error handling
          if (err) {
            console.error(err)
            return
          }

          var $ = cheerio.load(data.parse.text['*'])

          // Convert to a normal array
          var tr = []

          $('table.wikitable tr').each(function (index, element) {
            // if(index < 2)
            tr.push(element)
          })

          async.each(tr, function (element, seriesCallback2) {
            var comunePage = $(element).find('td a').attr('title')
            if (comunePage) {
              console.log("Loading '" + comunePage + "'")
              callApiForComune(comunePage, seriesCallback2, collection)
            } else {
              seriesCallback2(null)
            }
          }, seriesCallback)
        })
      }, callback)
    },
    function (callback) {
      console.log('Closing server connection')
      db.close()
      callback()
    }
  ],
  function (err, result) {
    if (err) {
      console.error('ERR')
      console.error(err)
      process.exit(1)
    } else {
      console.log('Operation completed')
      process.exit(0)
    }
  }
  )
})

/**
 * Call api for comune.
 * @param comunePage The comune page.
 * @param seriesCallback The series callback.
 * @param collection The collection that contains the data.
 */
function callApiForComune (comunePage, seriesCallback, collection) {
  var params = {
    action: 'parse',
    page: comunePage,
    format: 'json',
    prop: 'text'
  }
  client.api.call(params, function (err, info, next, data) {
    // error handling
    if (err) {
      console.error(err)
      console.log('Recalling for comune: ', comunePage)
      callApiForComune(comunePage, seriesCallback)
      return
    }

    // Load all the info about the comuni
    var comune = loadComuneInfo(data)

    var criteria = {
      nome: comune.nome,
      provincia: comune.provincia
    }

    // Replace the element if exists, otherwise insert a new one
    collection.update(criteria, comune, { upsert: true }, function (err, result) {
      if (err) {
        console.log('Error: ', err)
      } else {
        // console.log("Element inserted");
      }
      seriesCallback(null)
    })
  })
}

/**
 * Load the comuni info.
 * @param data The data returned from the MediaWiki API.
 * @returns A list of all the comuni.
 */
function loadComuneInfo (data) {
  var comune = {
    nome: data.parse.title
  }

  var html = data.parse.text['*']

  console.log("Parsing info of '" + comune.nome + "'")

  var $ = cheerio.load(html)
  $('table.sinottico > tbody > tr').each(function (index, element) {
    var th = $(element).find('th')
    var td = $(element).find('td')
    var thText = th.text()
    var tdText = td.text()

    if (th.hasClass('sinottico_testata')) {
      comune.tipo = th.find('a').text()
      comune.nome = th
        .clone()
        .children()
        .remove()
        .end()
        .text()
        .replace(/(\r\n|\n|\r)/gm, '')
    } else if (td.find('a[title] img').length > 0 && S(td.find('a[title] img')).contains('Stemma')) {
      var img = td.find('a[title] img')
      var stemma = img.first().attr('src')
      comune.stemma = S(stemma)
        .left(stemma.lastIndexOf('/'))
        .replaceAll('thumb/', '')
        .ensureLeft('http:')
        .s

      if (img.length > 1) {
        var bandiera = img.eq(1).attr('src')
        comune.bandiera = S(bandiera)
          .left(bandiera.lastIndexOf('/'))
          .replaceAll('thumb/', '')
          .ensureLeft('http:')
          .s
      }
    } else if (thText === 'Stato') {
      comune.stato = tdText.trim()
    } else if (thText === 'Regione') {
      comune.regione = tdText.trim()
    } else if (thText === 'Provincia') {
      comune.provincia = tdText.trim()
    } else if (thText === 'Città metropolitana') {
      comune.cittaMetropolitana = tdText.trim()
    } else if (thText === 'Capoluogo') {
      comune.capoluogo = tdText.trim()
    } else if (thText === 'Sindaco') {
      comune.sindaco = {
        nome: utils.removeAllAfterParenthesis(tdText),
        partito: utils.getParenthesisContent(tdText),
        inizioCarica: S(tdText).right(10).s
      }
    } else if (thText === 'Coordinate' || thText === 'Coordinate del capoluogo') {
      comune.latitudine = td.find('.latitude').first().text()
      comune.longitudine = td.find('.longitude').first().text()
      // comune.coordinate = td;
    } else if (thText === 'Altitudine') {
      comune.altitudine = tdText
    } else if (thText === 'Superficie') {
      comune.superficie = tdText
    } else if (thText === 'Abitanti') {
      comune.abitanti = utils.removeParenthesis(tdText)
      comune.censimento = utils.getParenthesisContent(tdText)
    } else if (thText === 'Densità') {
      comune.densita = tdText
    } else if (thText === 'Frazioni') {
      comune.frazioni = []
      var frazioni = tdText.split(',')
      comune.frazioni = frazioni
    } else if (thText === 'Comuni confinanti') {
      comune.comuniConfinanti = []
      var comuniConfinanti = tdText.split(',')
      comune.comuniConfinanti = comuniConfinanti
    } else if (thText === 'Cod. postale') {
      comune.codicePostale = []
      if (tdText.match(/\(/g)) {
        // Remove parenthesis if the string contains them
        tdText = utils.removeAllAfterParenthesis(tdText)
      }
      tdText = tdText.trim()

      // Multiple case
      if (tdText.length > 5) {
        var numberPattern = /\d+/g
        var codiciPostali = tdText.match(numberPattern)
        var zeros = utils.countLeftZeros(codiciPostali)

        // console.log(codiciPostali);
        // console.log("Zeros: ", zeros);

        codiciPostali[0] = S(codiciPostali[0]).toInt()
        codiciPostali[1] = S(codiciPostali[1]).toInt()

        for (; codiciPostali[0] <= codiciPostali[1]; codiciPostali[0]++) {
          var codiceToInsert = codiciPostali[0]
          codiceToInsert = S(codiceToInsert).ensureLeft(S('0').repeat(zeros).s).s
          comune.codicePostale.push(codiceToInsert)
        }
      } else {
        comune.codicePostale.push(tdText)
      }
    } else if (thText === 'Prefisso') {
      comune.prefisso = tdText
    } else if (thText === 'Fuso orario') {
      comune.fusoOrario = tdText
    } else if (thText === 'ISO 3166-2') {
      comune.ISO31662 = tdText
    } else if (thText === 'Codice ISTAT') {
      comune.codiceIstat = tdText
    } else if (thText === 'Cod. catastale') {
      comune.codCatastale = tdText
    } else if (thText === 'Targa') {
      comune.targa = tdText
    } else if (thText === 'Cl. sismica') {
      comune.classificazioneSismica = tdText
    } else if (thText === 'Cl. climatica') {
      comune.classificazioneClimatica = tdText
    } else if (thText === 'Nome abitanti') {
      comune.nomeAbitanti = tdText
    } else if (thText === 'Patrono') {
      comune.patrono = tdText
    } else if (thText === 'Giorno festivo') {
      comune.giornoFestivo = tdText
    } else if (thText === 'Sito istituzionale') {
      comune.sitoIstituzionale = th.find('a').attr('href')
    } else if (thText === 'Soprannome') {
      comune.soprannomi = tdText.split(',')
    }
  })

  comune = cleanCharacters(comune)

  return comune
}

/**
 * Clean all the characters.
 * @returns The comune instance without special characters.
 */
function cleanCharacters (comune) {
  Object.keys(comune).forEach(function (key) {
    var text = comune[key]

    if (Array.isArray(text) || typeof text === 'object') {
      Object.keys(text).forEach(function (secondKey) {
        if (!S(comune[key][secondKey]).isNumeric()) {
          comune[key][secondKey] = comune[key][secondKey].trim()
          comune[key][secondKey] = utils.removeBrackets(comune[key][secondKey])
        }
      })
    } else {
      comune[key] = utils.removeBrackets(text)
    }
  })

  return comune
}
