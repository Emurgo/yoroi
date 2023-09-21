import {Balance, Numbers} from '@yoroi/types'
import {Quantities} from '../../utils/quantities'
import {asQuantity} from '../../utils/asQuantity'

/**
 * Calculate the minimum amount of ADA received after accounting for slippage.
 *
 * @param {Balance.Quantity} outputAmount - The amount of ADA or output currency.
 * @param {number} slippagePercentage - The slippage percentage as a decimal (e.g., 3% as 0.03).
 * @param {number} decimals - The number of decimal places for formatting the result.
 * @param {NumberLocale} numberLocale - The locale information for formatting numbers.
 *
 * @returns {string} The minimum ADA amount received after slippage as a string with specified decimals.
 */

export const getMinAdaReceiveAfterSlippage = (
  outputAmount: Balance.Quantity,
  slippagePercentage: number,
  decimals: number,
  numberLocale: Numbers.Locale,
): string => {
  const slippageDecimal = slippagePercentage / 100
  const result = Number(outputAmount) / (1 + slippageDecimal)
  const [quantities] = Quantities.parseFromText(
    Quantities.denominated(asQuantity(result), decimals),
    decimals,
    numberLocale,
  )
  return quantities.slice(0, -1)
}
