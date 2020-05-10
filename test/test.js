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

const collection = getConnection()

async function getConnection () {
  try {
    // Use connect method to connect to the Server
    const client = await MongoClient.connect(url)

    return client.collection(mongodb.collection)
  } catch (err) {
    console.log(err.stack)
  }
}

describe('Compendio Vicorum', function () {
  it('should retrieve provincia information', function (done) {
    // Read the provincia information
    collection.find({}).toArray(function (err, docs) {
      assert.strictEqual(err, null)
      docs.each(function (doc) {
        assert.isDefined(doc.provincia)
      })
      done()
    })
  })

  it('should retrieve codicePostale information', function (done) {
    // Add check on the "Cod. postale" field for different cases
    collection.find({ nome: 'Abbasanta' }, function (err, item) {
      assert.strictEqual(err, null)
      assert.strictEqual(item.codicePostale, ['09071'])
      done()
    })

    collection.findOne({ nome: 'Palestrina' }, function (err, item) {
      assert.strictEqual(err, null)
      assert.strictEqual(item.codicePostale, ['00036'])
      done()
    })

    collection.findOne({ nome: 'Roma', tipo: 'comune' }, function (err, item) {
      assert.strictEqual(err, null)
      assert.strictEqual(item.codicePostale, findAllCodPostaliBetweenTwo('118', '199'))
      done()
    })
  })
})
