const v = require('voca')

/**
 * Count the number of the left zeros.
 * @param input The strings that contain the number of zero to count.
 * @returns The number of the left zero of the input strings.
 */
function countLeftZeros (input) {
  let zeros = 0
  if (input.length > 1) {
    while (v.startsWith(input[0], 0) && v.startsWith(input[1], 0)) {
      input[0] = v.substring(input[0], 1)
      input[1] = v.substring(input[1], 1)
      zeros++
    }
  }
  return zeros
}

/**
 * Remove all the characters after the parenthesis.
 * @returns The string without the content after the parenthesis.
 */
function removeAllAfterParenthesis (input) {
  return v.first(input, input.indexOf(' ('))
}

exports.removeAllAfterParenthesis = removeAllAfterParenthesis

/**
 * Get the content in the parenthesis.
 * @returns The string between the parenthesis.
 */
exports.getParenthesisContent = function getParenthesisContent (input) {
  let startingIndex = input.indexOf('(')
  if (startingIndex === -1) {
    return ''
  }

  startingIndex++
  let openingParenthesisCount = 1
  for (let i = startingIndex + 1; i < input.length; i++) {
    if (input[i] === ')') {
      openingParenthesisCount--
      if (openingParenthesisCount === 0) {
        return input.substring(startingIndex, i)
      }
    } else if (input[i] === '(') {
      openingParenthesisCount++
    }
  }
  return input.substring(startingIndex)
}

/**
 * Remove the parenthesis from the input string.
 * @returns The input string without the parenthesis.
 */
exports.removeParenthesis = function removeParenthesis (input) {
  return input.replace(/ *\([^)]*\) */g, '') // remove () and everything in them
}

/**
 * Remove the brackets from the input string.
 * @returns The input string without brackets.
 */
exports.removeBrackets = function removeBrackets (input) {
  return input.replace(/ *\[[^)]*\] */g, '') // remove [] and everything in them
}

/**
 * Pad the given string for the given width for the given symbol.
 * @param n The string to pad.
 * @param width The width of the padding.
 * @param z The symbol to use for the padding.
 * @returns The padded string.
 */
function pad (n, width, z) {
  z = z || '0'
  n = n + ''
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

/**
 * Find the sindaco name.
 * @param string The string from which retrieve the sindaco name.
 * @returns Returns the sindaco name.
 */
function findSindacoNome (string) {
  if (!v.includes(string, ' dal')) {
    return string
  }
  let sindacoName = v.first(string, v.indexOf(string, ' dal'))
  if (v.includes(sindacoName, '(')) {
    sindacoName = exports.removeAllAfterParenthesis(sindacoName)
  }
  return sindacoName
}

const MONTH_NAMES = [{
  name: 'gennaio',
  value: 1
},
{
  name: 'febbraio',
  value: 2
},
{
  name: 'marzo',
  value: 3
},
{
  name: 'aprile',
  value: 4
},
{
  name: 'maggio',
  value: 5
},
{
  name: 'giugno',
  value: 6
},
{
  name: 'luglio',
  value: 7
},
{
  name: 'agosto',
  value: 8
},
{
  name: 'settembre',
  value: 9
},
{
  name: 'ottobre',
  value: 10
},
{
  name: 'novembre',
  value: 11
},
{
  name: 'dicembre',
  value: 12
}]

/**
  * Replace the month with the corresponding month value.
  * @param {string} string The string containing the month.
  * @returns Returns the string with the replaced month.
  */
function replaceMonthNameWithDigit (string) {
  MONTH_NAMES.forEach(month => {
    const regex = new RegExp(month.name, 'i')
    string = string.replace(regex, month.value)
  })
  return string
}

/**
 * Find the sindaco inzio carica
 * @param {string} string The string from which retrieve the sindaco inizio carica field.
 * @returns Returns the sindaco inizio carica.
 */
function findSindacoInizioCarica (string) {
  const contentWithoutParenthesis = exports.removeParenthesis(string)
  let stringBeforeDate = 'dal '
  if (v.includes(contentWithoutParenthesis, 'dall\'')) {
    stringBeforeDate = 'dall\''
  }

  if (!v.includes(contentWithoutParenthesis, stringBeforeDate)) {
    return ''
  }

  let containingDate = v.substring(contentWithoutParenthesis, v.indexOf(contentWithoutParenthesis, stringBeforeDate))

  if (v.includes(containingDate, ' riconfermato')) {
    containingDate = v.substring(containingDate, 0, v.indexOf(containingDate, ' riconfermato'))
  }

  containingDate = replaceMonthNameWithDigit(containingDate)
  containingDate = v.replace(containingDate, 'º', '')

  // Handle bad case: "26-27 5 2019" or "26/27 5 2019" or "26/27-5-2019"
  let matches = containingDate.match(/(\d?\d(-|\/)\d?\d)( |-)(\d)*( |-)(\d\d\d\d)/)
  if (matches) {
    containingDate = v.first(matches[1], v.indexOf(matches[1], matches[2])) + ' ' + matches[4] + ' ' + matches[6]
  }

  const regex = /((\d?\d)(\/|-| |\.)(\d?\d)(\/|-| |\.)(\d?\d?\d\d)|(\d?\d)(\/|-| |\.)(\d?\d?\d\d)|(\d\d\d\d))/
  matches = regex.exec(containingDate)

  if (matches === null) {
    return ''
  } else {
    if (matches[2] && matches[4] && matches[6]) {
      // DD-MM-YYYY
      containingDate = matches[2] + '-' + matches[4] + '-' + matches[6]
    } else if (matches[7] && matches[9]) {
      // MM-YYYY
      containingDate = '01-' + matches[7] + '-' + matches[9]
    } else if (matches[10]) {
      // YYYY
      containingDate = '01-01-' + matches[10]
    }
  }

  const date = v.split(containingDate, '-')
  const day = pad(date[0], 2)
  const month = pad(date[1], 2)
  let year = v.first(date[2], 4)
  if (year.length === 2) {
    year = new Date().getFullYear().toString().substring(0, 2) + year
  }
  return day + '/' + month + '/' + year
}

/**
 * Build the sindaco from the input string.
 * @param string The string from which retrieve the sindaco information.
 * @returns Returns the sindaco object.
 */
exports.buildSindaco = function buildSindaco (string) {
  string = string.trim()
  return {
    nome: findSindacoNome(string),
    partito: exports.getParenthesisContent(string),
    inizioCarica: findSindacoInizioCarica(string)
  }
}

/**
 * Build the img url from the input string.
 * @param string The string from which build the img url.
 * @returns Returns the img url.
 */
exports.buildImgUrl = function buildImgUrl (string) {
  let stemma = v.first(string, string.lastIndexOf('/'))
  stemma = v.replaceAll(stemma, 'thumb/', '')

  if (!v.startsWith(stemma, 'https:')) {
    stemma = 'https:' + stemma
  }

  return stemma
}

/**
 * Build codici postali array from the input string.
 * @param string The string from which build codici postali array.
 * @returns Returns codici postali array.
 */
exports.buildCodiciPostali = function buildCodiciPostali (string) {
  const codiciPostaliArray = []
  if (string.match(/\(/g)) {
    // Remove parenthesis if the string contains them
    string = removeAllAfterParenthesis(string)
  }
  string = string.trim()

  // Multiple case
  if (string.length > 5) {
    const numberPattern = /\d+/g
    const codiciPostali = string.match(numberPattern)
    const zeros = countLeftZeros(codiciPostali)

    // console.log(codiciPostali)
    // console.log('Zeros: ', zeros)

    codiciPostali[0] = parseInt(codiciPostali[0])
    codiciPostali[1] = parseInt(codiciPostali[1])

    for (; codiciPostali[0] <= codiciPostali[1]; codiciPostali[0]++) {
      let codiceToInsert = codiciPostali[0]
      codiceToInsert = v.repeat('0', zeros) + codiceToInsert
      codiciPostaliArray.push(codiceToInsert)
    }
  } else {
    codiciPostaliArray.push(string)
  }

  return codiciPostaliArray
}

exports.generateAllCodPostaliBetweenTwo = function (start, end, prefix = '00') {
  const output = []
  for (; start <= end; start++) {
    output.push(prefix + start)
  }

  return output
}
