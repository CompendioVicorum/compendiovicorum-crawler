const assert = require('assert')
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

function findAllCodPostaliBetweenTwo (start, end) {
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

  it('should retrieve provincia information', function (done) {
    // Read the provincia information
    collection.find({}).toArray(function (err, docs) {
      assert.strictEqual(err, null)
      var i
      for (i = 0; i < docs.length; i++) {
        assert.isDefined(docs[i].provincia)
      }
      done()
    })
  })

  it('should retrieve codicePostale information of Abbasanta', function (done) {
    // Add check on the "Cod. postale" field for different cases
    collection.findOne({ nome: 'Abbasanta' }, function (err, item) {
      assert.strictEqual(err, null)
      assert.strictEqual(item.codicePostale, ['09071'])
      done()
    })
  })

  it('should retrieve codicePostale information of Palestrina', function (done) {
    collection.findOne({ nome: 'Palestrina' }, function (err, item) {
      assert.strictEqual(err, null)
      assert.strictEqual(item.codicePostale, ['00036'])
      done()
    })
  })

  it('should retrieve codicePostale information of Roma', function (done) {
    collection.findOne({ nome: 'Roma', tipo: 'comune' }, function (err, item) {
      assert.strictEqual(err, null)
      assert.strictEqual(item.codicePostale, findAllCodPostaliBetweenTwo('118', '199'))
      done()
    })
  })
})
