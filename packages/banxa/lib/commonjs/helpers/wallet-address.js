"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.banxaIsPossibleCardanoAddress = banxaIsPossibleCardanoAddress;
/**
 * Validates if is possible Cardano mainnet or testnet address.
 * We leave the address validation to the Banxa API, this is a simple check to avoid basic mistakes.
 * Banxa referal link doesn't work with testnet addreses or byron addresses.
 * @param {string} address - The Cardano address to validate.
 * @returns {boolean} - Returns true if the address looks like a Cardano address.
 */
function banxaIsPossibleCardanoAddress(address) {
  const shelleyRegex = /^(addr1)[0-9a-z]+$/;
  return shelleyRegex.test(address);
}
//# sourceMappingURL=wallet-address.js.map