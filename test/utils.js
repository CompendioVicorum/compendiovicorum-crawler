var chai = require('chai')
var assert = chai.assert // Using Assert style
var mocha = require('mocha')
var describe = mocha.describe
var it = mocha.it
var utils = require('../utils')

describe('Utils', function () {
  it('removeAllAfterParenthesis should remove all the text after the parenthesis', function (done) {
    assert.strictEqual(utils.removeAllAfterParenthesis('Test (text)'), 'Test')
    done()
  })

  it('getParenthesisContent should retrieve all the text in the parenthesis', function (done) {
    assert.strictEqual(utils.getParenthesisContent('Test (text)'), 'text')
    done()
  })
})
