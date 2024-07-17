import {atomicFormatter} from '@yoroi/common'
import {Numbers, Portfolio} from '@yoroi/types'

type AmountFormatterConfig = Readonly<{
  template?: string
  dropTraillingZeros?: boolean
  format?: Numbers.Locale
}>
/**
 * Formats the balance of a token in a portfolio.
 *
 * @param config - The configuration options for the balance formatter.
 * @param config.template - The template string to format the balance. Default is '{{value}}'.
 * @param config.dropTraillingZeros - Whether to drop trailing zeros in the formatted balance. Default is false.
 * @param config.format - The locale to use for formatting the balance.
 * @description The template string can contain the following placeholders: {{symbol}}, {{ticker}}, and {{value}}.
 *
 * @returns A function that takes a token balance and returns the formatted balance string.
 */
export function amountFormatter({
  dropTraillingZeros = false,
  template = '{{value}}',
  format,
}: AmountFormatterConfig = {}) {
  return ({
    quantity,
    info: {decimals, ticker, symbol},
  }: Portfolio.Token.Amount) => {
    const fmtBalance = atomicFormatter({
      value: quantity,
      decimalPlaces: decimals,
      format,
    })

    let trimmedValue = fmtBalance
    const decimalSeparator =
      format?.decimalSeparator ?? (1.1).toLocaleString().substring(1, 2)
    const [integerPart, decimalPart] = fmtBalance.split(decimalSeparator)

    if (decimals > 0 && dropTraillingZeros && decimalPart) {
      const trimmedDecimalPart = decimalPart.replace(/0+$/, '')
      trimmedValue = `${integerPart}${
        trimmedDecimalPart !== '' ? decimalSeparator : ''
      }${trimmedDecimalPart}`
    }

    return template
      .replace('{{symbol}}', symbol)
      .replace('{{ticker}}', ticker)
      .replace('{{value}}', trimmedValue)
  }
}
