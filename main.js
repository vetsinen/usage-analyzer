const fs = require('fs-extra');
const handleError = require('./error-handling');
const planize = require('./planize')

/**
 *
 * @param {string} jscode
 * @returns {object}
 * example: {
        customMessageId: 'incorrect_tenant',
        code: 401
    }
 * @description return codeid and messagetext from js-fragment
 */
function getCodesFromJsFragment(jscode){
    let msg, codeid
    try {
        msg = jscode.match(/customMessageId: '(.*?)'/)[1]
        codeid = +jscode.match(/code: (\d+)/)[1]
    }
    catch (e) {return false}
    return {
        customMessageId: msg,
        code: codeid
    }
}

/**
 * @description extract message ids
 * @param {string} text to extract message ids
 * @returns {array}
 */
function getIdsFromText(text){
    const regexpPattern = /ror\(req, res, {.*?code: .*?}\)/gs
    const matches = Array.from(text.matchAll(regexpPattern))
    const candidates = matches.map( el=> el[0])
    let rez = []
    for (jscode of candidates){
        let handleParams = getCodesFromJsFragment(jscode)
        if (handleParams) rez.push(handleParams)
    }
    return rez
}

module.exports = {getCodesFromJsFragment, getIdsFromText}

console.log(getIdsFromText(planize('./usage-example.js')));
// const clcode = "ror(req, res, {\n                customMessageId: `grandid_error_${grandIdResponse.errorObject.code}`,\n                code: grandIdResponse.errorObject.statusCode\n            })"
// const cfcode = "ror(req, res, {\n                customMessageId: 'incorrect_tenant',\n                code: 401\n            })"
// console.log(getCodesFromJsFragment(cfcode))
// let rez = getIdsFromText(planize('/usage-example.js'))
// console.log(rez[0])//(JSON.stringify(rez[1]))

