const assert = require('assert')
var mocha = require('mocha')
var describe = mocha.describe
var it = mocha.it
var MongoClient = require('mongodb').MongoClient
var config = require('../config')

// Connection URL
var mongodb = config.mongodb

var url = 'mongodb://'

if (mongodb.auth) {
  url += mongodb.username + ':' + mongodb.password + '@'
}

url += mongodb.server + ':' + mongodb.port + '/' + mongodb.database

function findAllCodPostaliBetweenTwo (start, end) {
  var output = []
  for (var i = 118; i <= 199; i++) {
    output.push('00' + i)
  }

  return output
}

describe('Compendio Vicorum', function () {
  it('should retrieve provincia information', function (done) {
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Error connecting to server')
        done()
      }

      var collection = db.collection(mongodb.collection)

      // Read the provincia information
      collection.find({}).toArray(function (err, docs) {
        assert.strictEqual(err, null)
        docs.each(function (doc) {
          assert.isDefined(doc.provincia)
        })
        done()
      })

      // TODO Add specific it here
      // Add check on the "Cod. postale" fields
      collection.find({ nome: 'Abbasanta' }).toArray(function (err, docs) {
        assert.strictEqual(err, null)
        docs.each(function (doc) {
          assert.isDefined(doc.provincia)
          assert.strictEqual(doc.codicePostale, ['09071'])
        })
        done()
      })

      collection.find({ nome: 'Palestrina' }).toArray(function (err, docs) {
        assert.strictEqual(err, null)
        docs.each(function (doc) {
          assert.isDefined(doc.provincia)
          assert.strictEqual(doc.codicePostale, ['00036'])
        })
        done()
      })

      collection.find({ nome: 'Roma', tipo: 'comune' }).toArray(function (err, docs) {
        assert.strictEqual(err, null)
        docs.each(function (doc) {
          assert.isDefined(doc.provincia)
          assert.strictEqual(doc.codicePostale, findAllCodPostaliBetweenTwo('118', '199'))
        })
        done()
      })
    })
  })
})
