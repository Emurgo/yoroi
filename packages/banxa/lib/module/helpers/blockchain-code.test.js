import { banxaIsBlockchainCode } from './blockchain-code';
describe('banxaIsBlockchainCode', () => {
  it('should return true for valid blockchain codes', () => {
    const validCoinTypes = ['ADA'];
    validCoinTypes.forEach(coinType => {
      expect(banxaIsBlockchainCode(coinType)).toBe(true);
    });
  });
  it('should return false for invalid blockchain codes', () => {
    const invalidCoinTypes = ['XRP', 'DOGE', '', undefined, null, 123];
    invalidCoinTypes.forEach(coinType => {
      expect(banxaIsBlockchainCode(coinType)).toBe(false);
    });
  });
});
//# sourceMappingURL=blockchain-code.test.js.map