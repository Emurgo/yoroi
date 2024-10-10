import {Balance} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {NumberLocale} from '../../kernel/i18n/languages'
import {RawUtxo} from '../types/other'
import {TokenId, YoroiEntry} from '../types/yoroi'

export const Entries = {
  first: (entries: YoroiEntry[]): YoroiEntry => {
    if (entries.length === 0) throw new Error('invalid entries')
    return entries[0]
  },
  remove: (entries: YoroiEntry[], removeAddresses: Array<string>): YoroiEntry[] => {
    return entries.filter((e) => !removeAddresses.includes(e.address))
  },
  toAddresses: (entries: YoroiEntry[]): Array<string> => {
    return entries.map((e) => e.address)
  },
  toAmounts: (entries: YoroiEntry[]): Balance.Amounts => {
    const amounts = entries.map((e) => e.amounts)
    return Amounts.sum(amounts)
  },
}

export const Amounts = {
  sum: (amounts: Array<Balance.Amounts>): Balance.Amounts => {
    const entries = amounts.map((amounts) => Object.entries(amounts)).flat()

    return entries.reduce(
      (result, [tokenId, quantity]) => ({
        ...result,
        [tokenId]: result[tokenId] ? Quantities.sum([result[tokenId], quantity]) : quantity,
      }),
      {} as Balance.Amounts,
    )
  },
  diff: (amounts1: Balance.Amounts, amounts2: Balance.Amounts): Balance.Amounts => {
    return Amounts.sum([amounts1, Amounts.negated(amounts2)])
  },
  includes: (amounts: Balance.Amounts, tokenId: string): boolean => {
    return Object.keys(amounts).includes(tokenId)
  },
  negated: (amounts: Balance.Amounts): Balance.Amounts => {
    const entries = Object.entries(amounts)
    const negatedEntries = entries.map(([tokenId, amount]) => [tokenId, Quantities.negated(amount)])

    return Object.fromEntries(negatedEntries)
  },
  remove: (amounts: Balance.Amounts, removeTokenIds: Array<TokenId>): Balance.Amounts => {
    const filteredEntries = Object.entries(amounts).filter(([tokenId]) => !removeTokenIds.includes(tokenId))

    return Object.fromEntries(filteredEntries)
  },
  getAmount: (amounts: Balance.Amounts, tokenId: string): Balance.Amount => {
    return {
      tokenId,
      quantity: amounts[tokenId] || Quantities.zero,
    }
  },
  getAmountsFromEntries: (entries: YoroiEntry[]): Balance.Amounts => {
    return Amounts.sum(entries.map((e) => e.amounts))
  },
  getAmountFromEntries: (entries: YoroiEntry[], tokenId: string): Balance.Amount => {
    return Amounts.getAmount(Amounts.getAmountsFromEntries(entries), tokenId)
  },
  save: (amounts: Balance.Amounts, amount: Balance.Amount): Balance.Amounts => {
    const {tokenId, quantity} = amount

    return {
      ...amounts,
      [tokenId]: quantity,
    }
  },
  map: (amounts: Balance.Amounts, fn: (amount: Balance.Amount) => Balance.Amount): Balance.Amounts =>
    Amounts.fromArray(Amounts.toArray(amounts).map(fn)),
  toArray: (amounts: Balance.Amounts) =>
    Object.keys(amounts).reduce(
      (result, current) => [...result, Amounts.getAmount(amounts, current)],
      [] as Array<Balance.Amount>,
    ),
  fromArray: (amounts: Array<Balance.Amount>) =>
    Object.fromEntries(amounts.map((amount) => [amount.tokenId, amount.quantity])),
}

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
    return new BigNumber(quantity1).minus(new BigNumber(quantity2)).toString(10) as Balance.Quantity
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
    return new BigNumber(quantity1).dividedBy(new BigNumber(quantity2)).toString(10) as Balance.Quantity
  },
  isGreaterThan: (quantity1: Balance.Quantity, quantity2: Balance.Quantity) => {
    return new BigNumber(quantity1).isGreaterThan(new BigNumber(quantity2))
  },
  decimalPlaces: (quantity: Balance.Quantity, precision: number) => {
    return new BigNumber(quantity).decimalPlaces(precision).toString(10) as Balance.Quantity
  },
  denominated: (quantity: Balance.Quantity, denomination: number) => {
    return Quantities.quotient(quantity, new BigNumber(10).pow(denomination).toString(10) as Balance.Quantity)
  },
  integer: (quantity: Balance.Quantity, denomination: number) => {
    return new BigNumber(quantity).decimalPlaces(denomination).shiftedBy(denomination).toString(10) as Balance.Quantity
  },
  zero: '0' as Balance.Quantity,
  isZero: (quantity: Balance.Quantity) => new BigNumber(quantity).isZero(),
  isAtomic: (quantity: Balance.Quantity, denomination: number) => {
    const absoluteQuantity = new BigNumber(quantity).decimalPlaces(denomination).abs()
    const minimalFractionalPart = new BigNumber(10).pow(new BigNumber(denomination).negated())

    return absoluteQuantity.isEqualTo(minimalFractionalPart)
  },
  parseFromText: (
    text: string,
    denomination: number,
    format: NumberLocale,
    precision = denomination,
  ): [string, Balance.Quantity] => {
    const {decimalSeparator} = format
    const invalid = new RegExp(`[^0-9${decimalSeparator}]`, 'g')
    const sanitized = text === '' ? '' : text.replaceAll(invalid, '')

    if (sanitized === '') return ['', Quantities.zero]
    if (sanitized.startsWith(decimalSeparator)) return [`0${decimalSeparator}`, Quantities.zero]

    const parts = sanitized.split(decimalSeparator)

    let fullDecValue = sanitized
    let value = sanitized

    let fullDecFormat = new BigNumber(fullDecValue.replace(decimalSeparator, '.')).toFormat()
    let input = fullDecFormat

    if (parts.length <= 1) {
      const quantity = asQuantity(
        new BigNumber(value.replace(decimalSeparator, '.')).decimalPlaces(precision).shiftedBy(denomination),
      )

      return [input, quantity]
    }

    const [int, dec] = parts
    // trailing `1` is to allow the user to type `1.0` without losing the decimal part
    fullDecValue = `${int}${decimalSeparator}${dec?.slice(0, precision)}1`
    value = `${int}${decimalSeparator}${dec?.slice(0, precision)}`
    fullDecFormat = new BigNumber(fullDecValue.replace(decimalSeparator, '.')).toFormat()
    // remove trailing `1`
    input = fullDecFormat.slice(0, -1)

    const quantity = asQuantity(
      new BigNumber(value.replace(decimalSeparator, '.')).decimalPlaces(precision).shiftedBy(denomination),
    )

    return [input, quantity]
  },
  format: (quantity: Balance.Quantity, denomination: number, precision?: number) => {
    if (precision === undefined) return new BigNumber(Quantities.denominated(quantity, denomination)).toFormat()
    return new BigNumber(Quantities.denominated(quantity, denomination)).decimalPlaces(precision).toFormat()
  },
}

export const asQuantity = (value: BigNumber | number | string) => {
  const bn = new BigNumber(value)
  if (bn.isNaN() || !bn.isFinite()) {
    throw new Error('Invalid quantity')
  }
  return bn.toString(10) as Balance.Quantity
}

export const Utxos = {
  toAmounts: (utxos: RawUtxo[], primaryTokenId: TokenId) => {
    return utxos.reduce(
      (previousAmounts, currentUtxo) => {
        const amounts = {
          ...previousAmounts,
          [primaryTokenId]: Quantities.sum([previousAmounts[primaryTokenId], currentUtxo.amount as Balance.Quantity]),
        }

        if (currentUtxo.assets) {
          return currentUtxo.assets.reduce((previousAmountsWithAssets, currentAsset) => {
            return {
              ...previousAmountsWithAssets,
              [currentAsset.assetId]: Quantities.sum([
                Amounts.getAmount(previousAmountsWithAssets, currentAsset.assetId).quantity,
                currentAsset.amount as Balance.Quantity,
              ]),
            }
          }, amounts)
        }

        return amounts
      },
      {[primaryTokenId]: Quantities.zero} as Balance.Amounts,
    )
  },
}

export const compareArrays = <T>(array1: Array<T>, array2: Array<T>) => {
  if (array1.length !== array2.length) return false
  return array1.every((item, index) => item === array2[index])
}

export const splitStringInto64CharArray = (inputString: string): string[] => {
  const maxLength = 64
  const resultArray: string[] = []

  for (let i = 0; i < inputString.length; i += maxLength) {
    const substring = inputString.slice(i, i + maxLength)
    resultArray.push(substring)
  }

  return resultArray
}
