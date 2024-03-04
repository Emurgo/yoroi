"use strict";

var _orderTypes = require("./order-types");
describe('banxaIsOrderType', () => {
  it('should return true for valid order types', () => {
    const validOrderTypes = ['buy', 'sell'];
    validOrderTypes.forEach(orderType => {
      expect((0, _orderTypes.banxaIsOrderType)(orderType)).toBe(true);
    });
  });
  it('should return false for invalid order types', () => {
    const invalidOrderTypes = ['deposit', 'withdraw', 'exchange', '', undefined, null, 123];
    invalidOrderTypes.forEach(orderType => {
      expect((0, _orderTypes.banxaIsOrderType)(orderType)).toBe(false);
    });
  });
});
//# sourceMappingURL=order-types.test.js.map