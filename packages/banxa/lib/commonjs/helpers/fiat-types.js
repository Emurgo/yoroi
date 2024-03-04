"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.banxaIsFiatType = banxaIsFiatType;
const supportedFiatTypes = ['USD', 'EUR'];
function banxaIsFiatType(value) {
  return supportedFiatTypes.includes(value);
}
//# sourceMappingURL=fiat-types.js.map