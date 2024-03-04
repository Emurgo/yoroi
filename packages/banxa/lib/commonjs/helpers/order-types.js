"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.banxaIsOrderType = banxaIsOrderType;
const supportedOrderTypes = ['buy', 'sell'];
function banxaIsOrderType(value) {
  return supportedOrderTypes.includes(value);
}
//# sourceMappingURL=order-types.js.map