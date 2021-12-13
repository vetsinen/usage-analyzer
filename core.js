//core module

/**
 *
 * @param {string} jscode
 * @returns {string}
 * example: 'incorrect_tenant'
 * @description return codeid and messagetext from js-fragment
 */
function getCodesFromJsFragment(jscode){
    let msg
    try {
        msg = jscode.match(/customMessageId: [`'](.*?)[`']/)[1]
        //codeid = +jscode.match(/code: (\d+)/)[1]
    }
    catch (e) {return false}
    return msg
}

/**
 * @description extract message ids
 * @param {string} text to extract message ids
 * @returns {array}
 */
function getIdsFromText(text){
    const regexpPattern = /handleError\(req, *?res, *?{.*?code: .*?}\)/gs
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

