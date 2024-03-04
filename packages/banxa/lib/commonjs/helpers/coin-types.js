"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.banxaIsCoinType = banxaIsCoinType;
const banxaSupportedCoinTypes = ['ADA'];
function banxaIsCoinType(value) {
  return banxaSupportedCoinTypes.includes(value);
}
//# sourceMappingURL=coin-types.js.map