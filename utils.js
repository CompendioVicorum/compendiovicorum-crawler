var S = require('string')

/**
 * Count the number of the zeros.
 * @param input The string that contains the number of zero to count.
 * @returns The number of the left zero of the input string.
 */
exports.countLeftZeros = function countLeftZeros (input) {
  var zeros = 0
  while (S(input[0]).startsWith(0) && S(input[1]).startsWith(0)) {
    input[0] = S(input[0]).chompLeft('0').s
    input[1] = S(input[1]).chompLeft('0').s
    zeros++
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
 * Remove the brackets from the input string.
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
