const chai = require('chai')
const assert = chai.assert // Using Assert style
const mocha = require('mocha')
const describe = mocha.describe
const it = mocha.it
const utils = require('../utils')

describe('Utils', function () {
  it('removeAllAfterParenthesis should remove all the text after the parenthesis', function () {
    assert.strictEqual(utils.removeAllAfterParenthesis('Test (text)'), 'Test')
  })

  describe('getParenthesisContent should', function () {
    it('retrieve all the text in the parenthesis if the parenthesis exist', function () {
      assert.strictEqual(utils.getParenthesisContent('Test (text)'), 'text')
    })

    it('return an empty string if the parenthesis don\'t exist', function () {
      assert.strictEqual(utils.getParenthesisContent('Test'), '')
    })

    it('handle the case there are multiple parenthesis nested', function () {
      assert.strictEqual(utils.getParenthesisContent('Test (text (1))'), 'text (1)')
    })

    it('handle the case there is a not closed parenthesis in the end', function () {
      assert.strictEqual(utils.getParenthesisContent('Test (text (1) test'), 'text (1) test')
    })
  })

  it('removeParenthesis should remove everything in the parenthesis', function () {
    assert.strictEqual(utils.removeParenthesis('Test (text)'), 'Test')
    assert.strictEqual(utils.removeParenthesis('Test'), 'Test')
    assert.strictEqual(utils.removeParenthesis('Test (A) (B)'), 'Test')
  })

  it('removeBrackets should remove everything in the parenthesis', function () {
    assert.strictEqual(utils.removeBrackets('Test [text]'), 'Test')
    assert.strictEqual(utils.removeBrackets('Test'), 'Test')
    assert.strictEqual(utils.removeBrackets('Test [A] [B]'), 'Test')
  })

  describe('buildSindaco should build the correct sindaco object in the case', function () {
    describe('of date', function () {
      it('with one mandate', function () {
        const tdText = 'Giuseppe Sala (indipendente di centro-sinistra) dal 21-6-2016'
        const expected = {
          nome: 'Giuseppe Sala',
          partito: 'indipendente di centro-sinistra',
          inizioCarica: '21/06/2016'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      describe('with two mandates', function () {
        it('with the second one between parenthesis', function () {
          const tdText = "Nicola Ottaviani (Lega) dal 21-5-2012 (2º mandato dall'11-6-2017)"
          const expected = {
            nome: 'Nicola Ottaviani',
            partito: 'Lega',
            inizioCarica: '21/05/2012'
          }
          assert.deepEqual(utils.buildSindaco(tdText), expected)
        })

        it('with the second one after "riconfermato" word', function () {
          const tdText = 'Antonio Saggese (lista civica) dal 16-5-2011 riconfermato il 5/6/2016'
          const expected = {
            nome: 'Antonio Saggese',
            partito: 'lista civica',
            inizioCarica: '16/05/2011'
          }
          assert.deepEqual(utils.buildSindaco(tdText), expected)
        })
      })

      it('with DD/MM/YYYY format', function () {
        const tdText = 'Andrea Vicini (Lista civica) dal 27/05/2019'
        const expected = {
          nome: 'Andrea Vicini',
          partito: 'Lista civica',
          inizioCarica: '27/05/2019'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with only the year', function () {
        const tdText = 'Granata Ginetta (lista civica) dal 2016'
        const expected = {
          nome: 'Granata Ginetta',
          partito: 'lista civica',
          inizioCarica: '01/01/2016'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with only the year with empty space at the end', function () {
        const tdText = 'Graziano Murada (Murada x Albosaggia Sindaco) dal 2018 '
        const expected = {
          nome: 'Graziano Murada',
          partito: 'Murada x Albosaggia Sindaco',
          inizioCarica: '01/01/2018'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('starting with dall\'', function () {
        const tdText = 'Giovanni Enrico Caranzano (Lista civica "la Rinascita di Acceglio") dall\'11-6-2018'
        const expected = {
          nome: 'Giovanni Enrico Caranzano',
          partito: 'Lista civica "la Rinascita di Acceglio"',
          inizioCarica: '11/06/2018'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with only one digit for the day', function () {
        const tdText = 'Josi Gerardo Della Ragione (FreeBacoli) dal 9-6-2019'
        const expected = {
          nome: 'Josi Gerardo Della Ragione',
          partito: 'FreeBacoli',
          inizioCarica: '09/06/2019'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with the month name', function () {
        const tdText = 'Gian Mario Morello (lista civica Balocco e Bastia Insieme) dal 10 giugno 2018 (2º mandato)'
        const expected = {
          nome: 'Gian Mario Morello',
          partito: 'lista civica Balocco e Bastia Insieme',
          inizioCarica: '10/06/2018'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with the month name with the first letter uppercase', function () {
        const tdText = 'Alessio Nizzi (lista Uniti per Fiumalbo) dal 27 Maggio 2019'
        const expected = {
          nome: 'Alessio Nizzi',
          partito: 'lista Uniti per Fiumalbo',
          inizioCarica: '27/05/2019'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with the month name with also the "-" character after', function () {
        const tdText = 'Andrea Checchi (Partito Democratico) dal 26 giugno 2017 - (2º mandato)'
        const expected = {
          nome: 'Andrea Checchi',
          partito: 'Partito Democratico',
          inizioCarica: '26/06/2017'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with the month name without the day', function () {
        const tdText = 'Maria Rosa Gnocchi (lista civica) dal giugno 2015'
        const expected = {
          nome: 'Maria Rosa Gnocchi',
          partito: 'lista civica',
          inizioCarica: '01/06/2015'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with the month and the year in the MM/YYYY format', function () {
        const tdText = 'Marco Corti (lista civica dal 1999) dal 05/2019'
        const expected = {
          nome: 'Marco Corti',
          partito: 'lista civica dal 1999',
          inizioCarica: '01/05/2019'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with DD/MM/YYYY format with also "-"', function () {
        const tdText = "Gianpaolo Beretta (lista civica di centrosinistra Impegno per Borgo) dall'08/05/2012 - 2º mandato"
        const expected = {
          nome: 'Gianpaolo Beretta',
          partito: 'lista civica di centrosinistra Impegno per Borgo',
          inizioCarica: '08/05/2012'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with DD-M-YY format', function () {
        const tdText = 'Roberto Valettini (lista civica Aulla nel cuore) dal 12-6-17'
        const expected = {
          nome: 'Roberto Valettini',
          partito: 'lista civica Aulla nel cuore',
          inizioCarica: '12/06/2017'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with DD-MM-YY format with the YY equals to the first two chars of the current year', function () {
        const tdText = 'Commissario straordinario dal 19-05-20'
        const expected = {
          nome: 'Commissario straordinario',
          partito: '',
          inizioCarica: '19/05/2020'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with DD.MM.YYYY format', function () {
        const tdText = 'Paolo Maria Belluardo (Calliano nel 2000) dal 25.05.2014'
        const expected = {
          nome: 'Paolo Maria Belluardo',
          partito: 'Calliano nel 2000',
          inizioCarica: '25/05/2014'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with Dº month name YYYY format', function () {
        const tdText = 'Francesco Crudele (centrodestra) dal 1º giugno 2015'
        const expected = {
          nome: 'Francesco Crudele',
          partito: 'centrodestra',
          inizioCarica: '01/06/2015'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with DD-DD month name YYYY format', function () {
        const tdText = 'Daniele Colombo (Lista civica di centrosinistra "Partecipo per Carugo") dal 26-27 maggio 2019'
        const expected = {
          nome: 'Daniele Colombo',
          partito: 'Lista civica di centrosinistra "Partecipo per Carugo"',
          inizioCarica: '26/05/2019'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with D-D month name YYYY format', function () {
        const tdText = 'Gian Mario Trapletti (lista civica) dal 3-4 ottobre 2021'
        const expected = {
          nome: 'Gian Mario Trapletti',
          partito: 'lista civica',
          inizioCarica: '03/10/2021'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with DD/DD month name YYYY format', function () {
        const tdText = 'Sergio Finato ([lista civica Bene Comune] - [lista civica Ambiente Comune]) dal 20/21 settembre 2020'
        const expected = {
          nome: 'Sergio Finato',
          partito: '[lista civica Bene Comune] - [lista civica Ambiente Comune]',
          inizioCarica: '20/09/2020'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })

      it('with DD/DD-MM-YYYY format', function () {
        const tdText = 'Claudio Mimiola (centro-sinistra) dal 20/21-09-2020'
        const expected = {
          nome: 'Claudio Mimiola',
          partito: 'centro-sinistra',
          inizioCarica: '20/09/2020'
        }
        assert.deepEqual(utils.buildSindaco(tdText), expected)
      })
    })

    it('of commissario prefettizio', function () {
      const tdText = 'Commissario prefettizio dal 27-06-2018'
      const expected = {
        nome: 'Commissario prefettizio',
        partito: '',
        inizioCarica: '27/06/2018'
      }
      assert.deepEqual(utils.buildSindaco(tdText), expected)
    })

    it('there is only the nome', function () {
      const tdText = 'Renato Rizzo'
      const expected = {
        nome: 'Renato Rizzo',
        partito: '',
        inizioCarica: ''
      }
      assert.deepEqual(utils.buildSindaco(tdText), expected)
    })

    it('there are parentheses in the partito field', function () {
      const tdText = 'Paolo Maria Belluardo (Calliano nel 2000 (lista civica)) dal 2014'
      const expected = {
        nome: 'Paolo Maria Belluardo',
        partito: 'Calliano nel 2000 (lista civica)',
        inizioCarica: '01/01/2014'
      }
      assert.deepEqual(utils.buildSindaco(tdText), expected)
    })
  })

  it('buildImgUrl should build the img url from the given string', function () {
    assert.strictEqual(utils.buildImgUrl('//upload.wikimedia.org/wikipedia/commons/thumb/f/f7/CoA_Citt%C3%A0_di_Bari.svg/80px-CoA_Citt%C3%A0_di_Bari.svg.png'), 'https://upload.wikimedia.org/wikipedia/commons/f/f7/CoA_Citt%C3%A0_di_Bari.svg')
    assert.strictEqual(utils.buildImgUrl('//upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Flag_of_Bari.svg/125px-Flag_of_Bari.svg.png'), 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Flag_of_Bari.svg')
  })

  describe('buildCodiciPostali should build the codici postali array from the given string', function () {
    it('with a single codice postale', function () {
      assert.deepEqual(utils.buildCodiciPostali('70032\n'), ['70032'])
    })

    describe('with multiple codice postali', function () {
      it('not zero-based', function () {
        assert.deepEqual(utils.buildCodiciPostali('70121–70132\n'), utils.generateAllCodPostaliBetweenTwo(121, 132, '70'))
      })

      it('zero-based', function () {
        assert.deepEqual(utils.buildCodiciPostali('00118–00199\n'), utils.generateAllCodPostaliBetweenTwo(118, 199))
      })
    })
  })
})
