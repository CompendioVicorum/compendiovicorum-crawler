var chai = require('chai')
var assert = chai.assert // Using Assert style
var mocha = require('mocha')
var describe = mocha.describe
var it = mocha.it
var before = mocha.before
var MongoClient = require('mongodb').MongoClient
var config = require('../config')

// Connection URL
var mongodb = config.mongodb

var url = 'mongodb://'

if (mongodb.auth) {
  url += mongodb.username + ':' + mongodb.password + '@'
}

url += mongodb.server + ':' + mongodb.port + '/' + mongodb.database

function generateAllCodPostaliBetweenTwo (start, end) {
  var output = []
  for (var i = 118; i <= 199; i++) {
    output.push('00' + i)
  }

  return output
}

let collection

describe('Compendio Vicorum', function () {
  before(function (done) {
    MongoClient.connect(url, function (err, db) {
      if (err) {
        return done(err)
      }

      collection = db.collection(mongodb.collection)
      done()
    })
  })

  it('should retrieve regione information', function (done) {
    // Read the regione information
    collection.find({}).toArray(function (err, docs) {
      assert.strictEqual(err, null)
      var i
      for (i = 0; i < docs.length; i++) {
        var doc = docs[i]
        assert.isDefined(doc.regione, 'The regione field is not defined for ' + doc.nome)
      }
      done()
    })
  })

  it('should retrieve provincia or città metropolitana information', function (done) {
    // Read the provincia information
    collection.find({}).toArray(function (err, docs) {
      assert.strictEqual(err, null)
      var i
      for (i = 0; i < docs.length; i++) {
        var doc = docs[i]
        if (!doc.provincia && !doc.cittaMetropolitana) {
          assert.fail('The provincia and the cittaMetropolitana fields are not defined for ' + doc.nome)
        }
      }
      done()
    })
  })

  it('should retrieve codicePostale information of Abbasanta', function (done) {
    // Add check on the "Cod. postale" field for different cases
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
      assert.deepEqual(item.codicePostale, generateAllCodPostaliBetweenTwo('118', '199'))
      done()
    })
  })
})
