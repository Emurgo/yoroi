import {Balance, Numbers} from '@yoroi/types'
import BigNumber from 'bignumber.js'

export const Quantities = {
  sum: (quantities: Array<Balance.Quantity>) => {
    return quantities
      .reduce((result, current) => result.plus(current), new BigNumber(0))
      .toString(10) as Balance.Quantity
  },
  max: (...quantities: Array<Balance.Quantity>) => {
    return BigNumber.max(...quantities).toString(10) as Balance.Quantity
  },
  diff: (quantity1: Balance.Quantity, quantity2: Balance.Quantity) => {
    return new BigNumber(quantity1)
      .minus(new BigNumber(quantity2))
      .toString(10) as Balance.Quantity
  },
  negated: (quantity: Balance.Quantity) => {
    return new BigNumber(quantity).negated().toString(10) as Balance.Quantity
  },
  product: (quantities: Array<Balance.Quantity>) => {
    return quantities.reduce((result, quantity) => {
      const x = new BigNumber(result).times(new BigNumber(quantity))

      return x.toString(10) as Balance.Quantity
    }, '1' as Balance.Quantity)
  },
  quotient: (quantity1: Balance.Quantity, quantity2: Balance.Quantity) => {
    return new BigNumber(quantity1)
      .dividedBy(new BigNumber(quantity2))
      .toString(10) as Balance.Quantity
  },
  isGreaterThan: (quantity1: Balance.Quantity, quantity2: Balance.Quantity) => {
    return new BigNumber(quantity1).isGreaterThan(new BigNumber(quantity2))
  },
  decimalPlaces: (quantity: Balance.Quantity, precision: number) => {
    return new BigNumber(quantity)
      .decimalPlaces(precision)
      .toString(10) as Balance.Quantity
  },
  denominated: (quantity: Balance.Quantity, denomination: number) => {
    return Quantities.quotient(
      quantity,
      new BigNumber(10).pow(denomination).toString(10) as Balance.Quantity,
    )
  },
  integer: (quantity: Balance.Quantity, denomination: number) => {
    return new BigNumber(quantity)
      .decimalPlaces(denomination)
      .shiftedBy(denomination)
      .toString(10) as Balance.Quantity
  },
  zero: '0' as Balance.Quantity,
  isZero: (quantity: Balance.Quantity) => new BigNumber(quantity).isZero(),
  isAtomic: (quantity: Balance.Quantity, denomination: number) => {
    const absoluteQuantity = new BigNumber(quantity)
      .decimalPlaces(denomination)
      .abs()
    const minimalFractionalPart = new BigNumber(10).pow(
      new BigNumber(denomination).negated(),
    )

    return absoluteQuantity.isEqualTo(minimalFractionalPart)
  },
  parseFromText: (text: string, precision: number, format: Numbers.Locale) => {
    const {decimalSeparator} = format
    const invalid = new RegExp(`[^0-9${decimalSeparator}]`, 'g')
    const sanitized = text === '' ? '' : text.replaceAll(invalid, '')
    if (sanitized === '') return ['', `0`] as [string, Balance.Quantity]
    if (sanitized === decimalSeparator)
      return [`0${decimalSeparator}`, `0`] as [string, Balance.Quantity]
    const parts = sanitized.split(decimalSeparator)
    const isDec = parts.length >= 2

    const fullDecValue = isDec
      ? `${parts[0]}${decimalSeparator}${parts[1]?.slice(0, precision)}1`
      : sanitized
    const fullDecFormat = new BigNumber(
      fullDecValue.replace(decimalSeparator, '.'),
    ).toFormat()
    const input = isDec ? fullDecFormat.slice(0, -1) : fullDecFormat

    const value = isDec
      ? `${parts[0]}${decimalSeparator}${parts[1]?.slice(0, precision)}`
      : sanitized
    const quantity = new BigNumber(value.replace(decimalSeparator, '.'))
      .decimalPlaces(precision)
      .shiftedBy(precision)
      .toString(10)

    return [input, quantity] as [string, Balance.Quantity]
  },
  format: (quantity: Balance.Quantity, denomination: number) => {
    return new BigNumber(
      Quantities.denominated(quantity, denomination),
    ).toFormat()
  },
}
