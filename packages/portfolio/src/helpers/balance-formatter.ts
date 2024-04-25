import {bigintFormatter} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'

type BalanceFormatterConfig = Readonly<{
  template?: string
  dropTraillingZeros?: boolean
}>
/**
 * Formats the balance of a token in a portfolio.
 *
 * @param config - The configuration options for the balance formatter.
 * @param config.template - The template string to format the balance. Default is '{{value}}'.
 * @param config.dropTraillingZeros - Whether to drop trailing zeros in the formatted balance. Default is false.
 * @description The template string can contain the following placeholders: {{symbol}}, {{ticker}}, and {{value}}.
 *
 * @returns A function that takes a token balance and returns the formatted balance string.
 */
export function balanceFormatter({
  dropTraillingZeros = false,
  template = '{{value}}',
}: BalanceFormatterConfig = {}) {
  return ({
    balance,
    info: {decimals, ticker, symbol},
  }: Portfolio.Token.Balance) => {
    const fmtBalance = bigintFormatter({
      value: balance,
      decimalPlaces: decimals,
    })

    let trimmedValue = fmtBalance

    if (decimals > 0 && dropTraillingZeros) {
      // locale dependent, so it grabs the farthest first
      const decimalSeparatorIndex = Math.max(
        fmtBalance.lastIndexOf(','),
        fmtBalance.lastIndexOf('.'),
      )
      const nonZeroIndex = fmtBalance
        .substring(decimalSeparatorIndex)
        .search(/[1-9]0*$/)
      if (nonZeroIndex !== -1) {
        trimmedValue = fmtBalance.substring(
          0,
          decimalSeparatorIndex + nonZeroIndex + 1,
        )
      }
    }

    return template
      .replace('{{symbol}}', symbol)
      .replace('{{ticker}}', ticker)
      .replace('{{value}}', trimmedValue)
  }
}
