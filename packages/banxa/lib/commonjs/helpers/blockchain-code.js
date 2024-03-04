"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.banxaIsBlockchainCode = banxaIsBlockchainCode;
const banxaSupportedBlockchainCodes = ['ADA'];
function banxaIsBlockchainCode(value) {
  return banxaSupportedBlockchainCodes.includes(value);
}
//# sourceMappingURL=blockchain-code.js.map