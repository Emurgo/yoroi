import { banxaIsCoinType } from './coin-types';
describe('banxaIsCoinType', () => {
  it('should return true for valid coin types', () => {
    const validCoinTypes = ['ADA'];
    validCoinTypes.forEach(coinType => {
      expect(banxaIsCoinType(coinType)).toBe(true);
    });
  });
  it('should return false for invalid coin types', () => {
    const invalidCoinTypes = ['XRP', 'DOGE', '', undefined, null, 123];
    invalidCoinTypes.forEach(coinType => {
      expect(banxaIsCoinType(coinType)).toBe(false);
    });
  });
});
//# sourceMappingURL=coin-types.test.js.map