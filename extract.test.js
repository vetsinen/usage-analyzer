const extractIds = require('./main');
const planize = require('./planize')

test('it returns type array', () => {
    expect(Array.isArray(extractIds('ttt'))).toBe(true);
});

test('it returns empty array, for trash text', () => {
    expect(extractIds(planize('/nothingtofind.js')))
        .toStrictEqual([]);
})

test('it returns not empty array, for target code', () => {
    expect(extractIds(planize('/usage-example.js')).length)
        .toBe(2);
})