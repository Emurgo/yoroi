/**
 * Validates if is possible Cardano mainnet or testnet address.
 * We leave the address validation to the Banxa API, this is a simple check to avoid basic mistakes.
 * @param {string} address - The Cardano address to validate.
 * @returns {boolean} - Returns true if the address looks like a Cardano address.
 */
export function banxaIsPossibleCardanoAddress(address: string) {
  const byronRegex = /^[Ae2][0-9A-Za-z]{57,58}$/
  const shelleyRegex = /^(addr1)[0-9a-z]+$/
  const shelleyTestnetRegex = /^(addr_test1)[0-9a-z]+$/
  return (
    byronRegex.test(address) ||
    shelleyRegex.test(address) ||
    shelleyTestnetRegex.test(address)
  )
}
