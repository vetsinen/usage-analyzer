const extractIds = require('./main');

test('it returns type array', () => {
    expect(Array.isArray(extractIds('ttt'))).toBe(true);
});

test('it returns empty array, for empty text', () => {
    expect(extractIds('')).toStrictEqual([]);
})