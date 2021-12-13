const fs = require('fs-extra');
const handleError = require('./error-handling');
const planize = require('./planize')

/**
 * @description extract message ids
 * @param {string} text to extract message ids
 * @returns {array}
 */
function getIdsFromText(text = "I love JavaScript"){
    const regexpPattern = /ror\(req, res, {.*?code:.*?}/gs
    const matches = Array.from(text.matchAll(regexpPattern))
    return matches.length
}

console.log(getIdsFromText(planize('/usage-example.js')))

module.exports = getIdsFromText