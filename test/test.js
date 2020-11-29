var chai = require('chai')
var assert = chai.assert // Using Assert style
var mocha = require('mocha')
var describe = mocha.describe
var it = mocha.it
var before = mocha.before
var after = mocha.after
var MongoClient = require('mongodb').MongoClient
var config = require('../config')

// Connection URL
var mongodb = config.mongodb

var url = 'mongodb://'

if (mongodb.auth) {
  url += mongodb.username + ':' + mongodb.password + '@'
}

url += mongodb.server + ':' + mongodb.port

function generateAllCodPostaliBetweenTwo (start, end, prefix = '00') {
  var output = []
  for (; start <= end; start++) {
    output.push(prefix + start)
  }

  return output
}

let collection
let mongoClient

describe('Compendio Vicorum', function () {
  before(function (done) {
    MongoClient.connect(url, function (err, client) {
      if (err) {
        return done(err)
      }
      mongoClient = client
      const db = client.db(mongodb.database)
      collection = db.collection(mongodb.collection)
      done()
    })
  })

  after(function () {
    mongoClient.close()
  })

  it('should retrieve basic information about the comune', function (done) {
    const propertiesToCheck = [
      'stato',
      'regione',
      'latitudine',
      'longitudine',
      'abitanti',
      'prefisso',
      'fusoOrario',
      'codiceIstat',
      'codCatastale'
    ]
    // Read the basic information about the comune
    collection.find({}).toArray(function (err, docs) {
      assert.strictEqual(err, null)
      var i
      for (i = 0; i < docs.length; i++) {
        var doc = docs[i]
        var j
        for (j = 0; j < propertiesToCheck.length; j++) {
          var propertyToCheck = propertiesToCheck[j]
          assert.isDefined(doc[propertyToCheck], 'The ' + propertyToCheck + ' field is not defined for ' + doc.nome)
        }
      }
      done()
    })
  })

  it('should retrieve the sindaco.inizioCarica field in the right format', function (done) {
    collection.find({}).toArray(function (err, docs) {
      assert.strictEqual(err, null)
      var i
      for (i = 0; i < docs.length; i++) {
        var doc = docs[i]
        if (doc.sindaco && doc.sindaco.inizioCarica) {
          const inizioCarica = doc.sindaco.inizioCarica
          assert.match(inizioCarica, /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/, 'The sindaco.inizioCarica field is not defined for ' + doc.nome)
        }
      }
      done()
    })
  })

  it('should retrieve codicePostale information of Abbasanta', function (done) {
    collection.findOne({ nome: 'Abbasanta' }, function (err, item) {
      assert.strictEqual(err, null)
      assert.deepEqual(item.codicePostale, ['09071'])
      done()
    })
  })

  it('should retrieve codicePostale information of Palestrina', function (done) {
    collection.findOne({ nome: 'Palestrina' }, function (err, item) {
      assert.strictEqual(err, null)
      assert.deepEqual(item.codicePostale, ['00036'])
      done()
    })
  })

  it('should retrieve codicePostale information of Roma', function (done) {
    collection.findOne({ nome: 'Roma' }, function (err, item) {
      assert.strictEqual(err, null)
      assert.deepEqual(item.codicePostale, generateAllCodPostaliBetweenTwo(118, 199))
      done()
    })
  })

  it('should retrieve all the information of Bari', function (done) {
    collection.findOne({ nome: 'Bari' }, function (err, item) {
      assert.strictEqual(err, null)
      assert.strictEqual(item.stato, 'Italia')
      assert.strictEqual(item.regione, 'Puglia')
      assert.strictEqual(item.cittaMetropolitana, 'Bari')
      assert.strictEqual(item.stemma, 'https://upload.wikimedia.org/wikipedia/commons/f/f7/CoA_Citt%C3%A0_di_Bari.svg')
      assert.strictEqual(item.bandiera, 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Flag_of_Bari.svg')
      const expectedSindaco = {
        nome: 'Antonio Decaro',
        partito: 'PD',
        inizioCarica: '23/06/2014'
      }
      const expectedComuniConfinanti = ['Adelfia', 'Bitonto', 'Bitritto', 'Capurso', 'Giovinazzo', 'Modugno', 'Mola di Bari', 'Noicattaro', 'Triggiano', 'Valenzano']
      assert.deepEqual(item.sindaco, expectedSindaco)
      assert.strictEqual(item.dataIstituzione, '19 gennaio 1863')
      assert.strictEqual(item.latitudine, '41°07′31″N')
      assert.strictEqual(item.longitudine, '16°52′00″E')
      assert.strictEqual(item.altitudine, '5 m s.l.m.')
      assert.strictEqual(item.superficie, '116,17 km²')
      assert.strictEqual(item.abitanti, '320 730')
      assert.strictEqual(item.densita, '2 760,87 ab./km²')
      assert.deepEqual(item.comuniConfinanti, expectedComuniConfinanti)
      assert.deepEqual(item.codicePostale, generateAllCodPostaliBetweenTwo(121, 132, '70'))
      assert.strictEqual(item.prefisso, '080')
      assert.strictEqual(item.fusoOrario, 'UTC+1')
      assert.strictEqual(item.codiceIstat, '072006')
      assert.strictEqual(item.codCatastale, 'A662')
      assert.strictEqual(item.targa, 'BA')
      assert.strictEqual(item.classificazioneSismica, 'zona 3 (sismicità bassa)')
      assert.strictEqual(item.classificazioneClimatica, 'zona C, 1 185 GG')
      assert.strictEqual(item.nomeAbitanti, 'baresi')
      assert.strictEqual(item.patrono, 'San Nicola, San Sabino (compatrono), Madonna Odigitria')
      assert.strictEqual(item.giornoFestivo, '8 maggio - San Nicola')
      assert.strictEqual(item.sitoIstituzionale, 'http://www.comune.bari.it')
      done()
    })
  })
})
