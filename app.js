const Bot = require('nodemw')
const async = require('async')
const cheerio = require('cheerio')
const v = require('voca')
const MongoClient = require('mongodb').MongoClient

const config = require('./config')
const utils = require('./utils')
const cheerioOptions = {
  normalizeWhitespace: true
}

// Create a client with configuration
const mediaWikiClient = new Bot({
  protocol: 'https',
  server: 'it.wikipedia.org', // host name of MediaWiki-powered site
  path: '/w', // path to api.php script
  debug: false // is more verbose when set to true
})

// Connection URL
const mongodb = config.mongodb

let url = 'mongodb://'

if (mongodb.auth) {
  url += mongodb.username + ':' + mongodb.password + '@'
}

url += mongodb.server + ':' + mongodb.port

MongoClient.connect(url, function (err, client) {
  if (err) {
    console.log('Error connecting to server')
    process.exit(1)
  } else {
    console.log('Connected correctly to server')
  }

  const db = client.db(mongodb.database)
  const collection = db.collection(mongodb.collection)
  collection.createIndex({ nome: 1 }, function (err) {
    if (err) {
      console.error('Error creating the index.')
    }
  })

  async.waterfall([
    function (callback) {
      mediaWikiClient.getPagesByPrefix('Comuni_d\'Italia_(', function (err, data) {
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
        const title = comuniList.title
        const params = {
          action: 'parse',
          page: title,
          format: 'json',
          prop: 'text'
        }

        // Find all comuni
        mediaWikiClient.api.call(params, function (err, info, next, data) {
          // error handling
          if (err) {
            console.error(err)
            return
          }

          const $ = cheerio.load(data.parse.text['*'], cheerioOptions)

          // Convert to a normal array
          const tr = []

          $('table.wikitable tr').each(function (index, element) {
            // if(index < 2)
            tr.push(element)
          })

          async.each(tr, function (element, seriesCallback2) {
            const comunePage = $(element).find('td a').attr('title')
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
      client.close()
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
  const params = {
    action: 'parse',
    page: comunePage,
    format: 'json',
    prop: 'text',
    redirects: ''
  }
  mediaWikiClient.api.call(params, function (err, info, next, data) {
    // error handling
    if (err) {
      console.error(err)
      console.log('Recalling for comune: ', comunePage)
      callApiForComune(comunePage, seriesCallback)
      return
    }

    // Load all the info about the comuni
    const comune = loadComuneInfo(data)

    const criteria = {
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
  let comune = {
    nome: data.parse.title
  }

  const html = data.parse.text['*']

  console.log("Parsing info of '" + comune.nome + "'")

  const $ = cheerio.load(html, cheerioOptions)
  $('table.sinottico > tbody > tr').each(function (index, element) {
    const th = $(element).find('th')
    const td = $(element).find('td')
    const thText = th.text()
    const tdText = td.text().trim()

    if (th.hasClass('sinottico_testata')) {
      comune.tipo = th.find('a').text()
      comune.nome = th
        .clone()
        .children()
        .remove()
        .end()
        .text()
        .replace(/(\r\n|\n|\r)/gm, '')
    } else if (td.find('a[title] img').length > 0 && v.includes(td.find('a[title] img'), 'Stemma')) {
      const img = td.find('a[title] img')
      const stemma = img.first().attr('src')
      comune.stemma = utils.buildImgUrl(stemma)

      if (img.length > 1) {
        const bandiera = img.eq(1).attr('src')
        comune.bandiera = utils.buildImgUrl(bandiera)
      }
    } else if (thText === 'Stato') {
      comune.stato = tdText
    } else if (thText === 'Regione') {
      comune.regione = tdText
    } else if (thText === 'Provincia') {
      comune.provincia = tdText
    } else if (thText === 'Città metropolitana') {
      comune.cittaMetropolitana = tdText
    } else if (thText === 'Capoluogo') {
      comune.capoluogo = tdText
    } else if (thText === 'Sindaco') {
      comune.sindaco = utils.buildSindaco(tdText)
    } else if (thText === 'Data di istituzione') {
      comune.dataIstituzione = tdText
    } else if (thText === 'Coordinate' || thText === 'Coordinatedel capoluogo') {
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
      const frazioni = tdText.split(',')
      comune.frazioni = frazioni
    } else if (thText === 'Comuni confinanti') {
      comune.comuniConfinanti = []
      const comuniConfinanti = tdText.split(',')
      comune.comuniConfinanti = comuniConfinanti
    } else if (thText === 'Cod. postale') {
      comune.codicePostale = utils.buildCodiciPostali(tdText)
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
    const text = comune[key]

    if (Array.isArray(text) || typeof text === 'object') {
      Object.keys(text).forEach(function (secondKey) {
        if (!v.isNumeric(comune[key][secondKey])) {
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
