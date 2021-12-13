const planize = require('./planize')
const {getCodesFromJsFragment, getIdsFromText} = require("./main");

test('get false for contentless code', () => {
    const clcode = "ror(req, res, {\n                customMessageId: `grandid_error_${grandIdResponse.errorObject.code}`,\n                code: grandIdResponse.errorObject.statusCode\n            })"
    expect(getCodesFromJsFragment(clcode)).toStrictEqual(false);
});

test('get codes for contentfull code', () => {
    const cfcode = "ror(req, res, {\n                customMessageId: 'incorrect_tenant',\n                code: 401\n            })"
    expect(getCodesFromJsFragment(cfcode)).toStrictEqual({
        customMessageId: 'incorrect_tenant',
        code: 401
    });
});

test('it returns type array', () => {
    expect(Array.isArray(getIdsFromText('ttt'))).toBe(true);
});

test('it returns empty array, for trash text', () => {
    expect(getIdsFromText(planize('./nothingtofind.js')))
        .toStrictEqual([]);
})

test('it returns not empty array, for target code', () => {
    expect(getIdsFromText(planize('./usage-example.js')).length)
        .toBe(2);
})