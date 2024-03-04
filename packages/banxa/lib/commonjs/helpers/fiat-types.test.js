"use strict";

var _fiatTypes = require("./fiat-types");
describe('banxaIsFiatType', () => {
  it('should return true for valid fiat types', () => {
    const validFiatTypes = ['USD', 'EUR'];
    validFiatTypes.forEach(fiatType => {
      expect((0, _fiatTypes.banxaIsFiatType)(fiatType)).toBe(true);
    });
  });
  it('should return false for invalid fiat types', () => {
    const invalidFiatTypes = ['GBP', 'JPY', 'AUD', '', undefined, null, 123];
    invalidFiatTypes.forEach(fiatType => {
      expect((0, _fiatTypes.banxaIsFiatType)(fiatType)).toBe(false);
    });
  });
});
//# sourceMappingURL=fiat-types.test.js.map