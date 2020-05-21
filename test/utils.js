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
    assert.strictEqual(utils.getParenthesisContent('Test'), '')
    done()
  })

  it('removeParenthesis should remove everything in the parenthesis', function (done) {
    assert.strictEqual(utils.removeParenthesis('Test (text)'), 'Test')
    assert.strictEqual(utils.removeParenthesis('Test'), 'Test')
    assert.strictEqual(utils.removeParenthesis('Test (A) (B)'), 'Test')
    done()
  })

  it('removeBrackets should remove everything in the parenthesis', function (done) {
    assert.strictEqual(utils.removeBrackets('Test [text]'), 'Test')
    assert.strictEqual(utils.removeBrackets('Test'), 'Test')
    assert.strictEqual(utils.removeBrackets('Test [A] [B]'), 'Test')
    done()
  })

  it('buildSindaco should build the correct sindaco object in the case of one mandate', function (done) {
    const tdText = 'Giuseppe Sala (indipendente di centro-sinistra) dal 21-6-2016'
    const expected = {
      nome: 'Giuseppe Sala',
      partito: 'indipendente di centro-sinistra',
      inizioCarica: '21/06/2016'
    }
    assert.deepEqual(utils.buildSindaco(tdText), expected)
    done()
  })

  it('buildSindaco should build the correct sindaco object in the case of two mandates', function (done) {
    const tdText = "Nicola Ottaviani (Lega) dal 21-5-2012 (2º mandato dall'11-6-2017)"
    const expected = {
      nome: 'Nicola Ottaviani',
      partito: 'Lega',
      inizioCarica: '21/05/2012'
    }
    assert.deepEqual(utils.buildSindaco(tdText), expected)
    done()
  })

  it('buildSindaco should build the correct sindaco object in the case of commissario prefettizio', function (done) {
    const tdText = 'Commissario prefettizio dal 27-06-2018'
    const expected = {
      nome: 'Commissario prefettizio',
      partito: '',
      inizioCarica: '27/06/2018'
    }
    assert.deepEqual(utils.buildSindaco(tdText), expected)
    done()
  })

  it('buildSindaco should build the correct sindaco object in the case of date in DD/MM/YYYY format', function (done) {
    const tdText = 'Andrea Vicini (Lista civica) dal 27/05/2019'
    const expected = {
      nome: 'Andrea Vicini',
      partito: 'Lista civica',
      inizioCarica: '27/05/2019'
    }
    assert.deepEqual(utils.buildSindaco(tdText), expected)
    done()
  })

  it('buildSindaco should build the correct sindaco object in the case of date with only the year', function (done) {
    const tdText = 'Granata Ginetta (lista civica) dal 2016'
    const expected = {
      nome: 'Granata Ginetta',
      partito: 'lista civica',
      inizioCarica: '01/01/2016'
    }
    assert.deepEqual(utils.buildSindaco(tdText), expected)
    done()
  })

  it('buildSindaco should build the correct sindaco object in the case of date starting with dall\'', function (done) {
    const tdText = 'Giovanni Enrico Caranzano (Lista civica "la Rinascita di Acceglio") dall\'11-6-2018'
    const expected = {
      nome: 'Giovanni Enrico Caranzano',
      partito: 'Lista civica "la Rinascita di Acceglio"',
      inizioCarica: '11/06/2018'
    }
    assert.deepEqual(utils.buildSindaco(tdText), expected)
    done()
  })

  it('buildSindaco should build the correct sindaco object in the case of date with only one digit for the day', function (done) {
    const tdText = 'Josi Gerardo Della Ragione (FreeBacoli) dal 9-6-2019'
    const expected = {
      nome: 'Josi Gerardo Della Ragione',
      partito: 'FreeBacoli',
      inizioCarica: '09/06/2019'
    }
    assert.deepEqual(utils.buildSindaco(tdText), expected)
    done()
  })
})
