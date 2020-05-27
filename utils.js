var S = require('string')

const SEPARATORS = ['/', '-', ' ', '.']

/**
 * Count the number of the left zeros.
 * @param input The strings that contain the number of zero to count.
 * @returns The number of the left zero of the input strings.
 */
exports.countLeftZeros = function countLeftZeros (input) {
  var zeros = 0
  if (input.length > 1) {
    while (S(input[0]).startsWith(0) && S(input[1]).startsWith(0)) {
      input[0] = S(input[0]).chompLeft('0').s
      input[1] = S(input[1]).chompLeft('0').s
      zeros++
    }
  }
  return zeros
}

/**
 * Remove all the characters after the parenthesis.
 * @returns The string without the content after the parenthesis.
 */
exports.removeAllAfterParenthesis = function removeAllAfterParenthesis (input) {
  return S(input).left(input.indexOf(' (')).s
}

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
  if (!S(string).contains(' dal')) {
    return string
  }
  let sindacoName = S(string).between('', ' dal').s
  if (S(sindacoName).contains('(')) {
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
  if (S(contentWithoutParenthesis).contains('dall\'')) {
    stringBeforeDate = 'dall\''
  }

  if (!S(contentWithoutParenthesis).contains(stringBeforeDate)) {
    return ''
  }

  let containingDate = S(contentWithoutParenthesis).between(stringBeforeDate)
  containingDate = replaceMonthNameWithDigit(containingDate)
  containingDate = containingDate.replace('º', '')

  // Handle bad case: "26-27 5 2019"
  const matches = containingDate.match(/(\d?\d-\d?\d) (\d)* (\d\d\d\d)/)
  if (matches) {
    containingDate = S(matches[1]).between('', '-').s + ' ' + matches[2] + ' ' + matches[3]
    containingDate = S(containingDate)
  }
  let sep = ''

  for (let i = 0; i < SEPARATORS.length; i++) {
    const separator = SEPARATORS[i]
    if (containingDate.count(separator) > 0) {
      sep = separator
      break
    }
  }

  if (sep === '') {
    containingDate = S('01-01-' + containingDate)
    sep = '-'
  }

  if (containingDate.count(sep) === 1) {
    const partialDate = containingDate.split(sep)
    containingDate = S('01-' + partialDate[0] + '-' + partialDate[1])
    sep = '-'
  }

  const date = containingDate.splitLeft(sep)
  const day = pad(date[0], 2)
  const month = pad(date[1], 2)
  const year = S(date[2]).left(4).ensureLeft(new Date().getFullYear().toString().slice(-2)).s
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
