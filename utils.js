var S = require('string')

/**
 * Count the number of the left zeros.
 * @param input The string that contains the number of zero to count.
 * @returns The number of the left zero of the input string.
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
  return S(input).between('(', ')').s
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
  let sindacoName = S(string).between('', ' dal').s
  if (S(sindacoName).contains('(')) {
    sindacoName = exports.removeAllAfterParenthesis(sindacoName)
  }
  return sindacoName
}

/**
 * Build the sindaco from the input string.
 * @param string The string from which retrieve the sindaco information.
 * @returns Returns the sindaco object.
 */
exports.buildSindaco = function buildSindaco (string) {
  let containingDate = S(string).between(' dal ')
  let sep = '-'
  if (containingDate.count('-') > 1) {
    sep = '-'
  } else if (containingDate.count('/') > 1) {
    sep = '/'
  } else {
    containingDate = S('01-01-' + containingDate)
  }
  const date = containingDate.splitLeft(sep)
  const day = date[0]
  const month = pad(date[1], 2)
  const year = S(date[2]).left(4).s
  return {
    nome: findSindacoNome(string),
    partito: exports.getParenthesisContent(string),
    inizioCarica: day + '/' + month + '/' + year
  }
}
