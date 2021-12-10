const fs = require('fs-extra');
const handleError = require('./error-handling');

/**
 * @description extract message ids
 * @param {string} text to extract message ids
 * @returns {array}
 */
function getIdsFromText(text = "I love JavaScript"){
    return text.match(/Java(Script)/)
}

console.log(getIdsFromText())

module.exports = getIdsFromText