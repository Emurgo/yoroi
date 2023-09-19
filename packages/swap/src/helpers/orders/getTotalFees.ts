import {Balance, NumberLocale} from '@yoroi/types'
import {Quantities} from '../../utils/quantities'

/**
 * Calculate the total fees by summing the batcher fee and provider fee.
 * Later we can add the fronted feee
 *
 * @param {Balance.Quantity} batcherFee - The batcher fee as a balance quantity.
 * @param {Balance.Quantity} providerFee - The provider fee as a balance quantity.
 * @param {number} decimals - The number of decimal places for formatting the result.
 * @param {NumberLocale} numberLocale - The locale information for formatting numbers.
 *
 * @returns {string} The total fees as a string with specified decimals.
 */

export const getTotalFees = (
  batcherFee: Balance.Quantity,
  proiderFee: Balance.Quantity,
  decimals: number,
  numberLocale: NumberLocale,
): string => {
  const result = Quantities.denominated(
    Quantities.sum([batcherFee, proiderFee]),
    decimals ?? 0,
  )
  const [quantities] = Quantities.parseFromText(
    result,
    decimals ?? 0,
    numberLocale,
  )
  return quantities
}
