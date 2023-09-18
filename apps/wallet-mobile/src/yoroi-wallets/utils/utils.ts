import {Portfolio} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {NumberLocale} from '../../i18n/languages'
import {RawUtxo, TokenId, YoroiEntries, YoroiEntry} from '../types'

export const Entries = {
  first: (entries: YoroiEntries): YoroiEntry => {
    const addresses = Object.keys(entries)
    if (addresses.length > 1) throw new Error('multiple addresses not supported')
    const firstEntry = Object.entries(entries)[0]
    if (!firstEntry) throw new Error('invalid entries')

    return {
      address: firstEntry[0],
      amounts: firstEntry[1],
    }
  },
  remove: (entries: YoroiEntries, removeAddresses: Array<string>): YoroiEntries => {
    const _entries = Object.entries(entries)
    const filteredEntries = _entries.filter(([address]) => !removeAddresses.includes(address))

    return Object.fromEntries(filteredEntries)
  },
  toAddresses: (entries: YoroiEntries): Array<string> => {
    return Object.keys(entries)
  },
  toAmounts: (entries: YoroiEntries): Portfolio.Amounts => {
    const amounts = Object.values(entries)

    return Amounts.sum(amounts)
  },
}

export const Amounts = {
  sum: (amounts: Array<Portfolio.Amounts>): Portfolio.Amounts => {
    const entries = amounts.map((amounts) => Object.entries(amounts)).flat()

    return entries.reduce(
      (result, [tokenId, quantity]) => ({
        ...result,
        [tokenId]: result[tokenId] ? Quantities.sum([result[tokenId], quantity]) : quantity,
      }),
      {} as Portfolio.Amounts,
    )
  },
  diff: (amounts1: Portfolio.Amounts, amounts2: Portfolio.Amounts): Portfolio.Amounts => {
    return Amounts.sum([amounts1, Amounts.negated(amounts2)])
  },
  includes: (amounts: Portfolio.Amounts, tokenId: string): boolean => {
    return Object.keys(amounts).includes(tokenId)
  },
  negated: (amounts: Portfolio.Amounts): Portfolio.Amounts => {
    const entries = Object.entries(amounts)
    const negatedEntries = entries.map(([tokenId, amount]) => [tokenId, Quantities.negated(amount)])

    return Object.fromEntries(negatedEntries)
  },
  remove: (amounts: Readonly<Portfolio.Amounts>, removeTokenIds: ReadonlyArray<TokenId>): Portfolio.Amounts => {
    const filteredEntries = Object.entries(amounts).filter(([tokenId]) => !removeTokenIds.includes(tokenId))

    return Object.fromEntries(filteredEntries)
  },
  getAmount: (amounts: Readonly<Portfolio.Amounts>, tokenId: string): Portfolio.Amount => {
    return {
      tokenId,
      quantity: amounts[tokenId] || Quantities.zero,
    }
  },
  save: (amounts: Portfolio.Amounts, amount: Portfolio.Amount): Portfolio.Amounts => {
    const {tokenId, quantity} = amount

    return {
      ...amounts,
      [tokenId]: quantity,
    }
  },
  map: (amounts: Portfolio.Amounts, fn: (amount: Portfolio.Amount) => Portfolio.Amount): Portfolio.Amounts =>
    Amounts.fromArray(Amounts.toArray(amounts).map(fn)),
  toArray: (amounts: Portfolio.Amounts) =>
    Object.keys(amounts).reduce(
      (result, current) => [...result, Amounts.getAmount(amounts, current)],
      [] as Array<Portfolio.Amount>,
    ),
  fromArray: (amounts: Array<Portfolio.Amount>) =>
    Object.fromEntries(amounts.map((amount) => [amount.tokenId, amount.quantity])),
  ids: (amounts: Portfolio.Amounts): ReadonlyArray<string> => Object.keys(amounts),
}

export const Quantities = {
  sum: (quantities: Array<Portfolio.Quantity>) => {
    return quantities
      .reduce((result, current) => result.plus(current), new BigNumber(0))
      .toString(10) as Portfolio.Quantity
  },
  max: (...quantities: Array<Portfolio.Quantity>) => {
    return BigNumber.max(...quantities).toString(10) as Portfolio.Quantity
  },
  diff: (quantity1: Portfolio.Quantity, quantity2: Portfolio.Quantity) => {
    return new BigNumber(quantity1).minus(new BigNumber(quantity2)).toString(10) as Portfolio.Quantity
  },
  negated: (quantity: Portfolio.Quantity) => {
    return new BigNumber(quantity).negated().toString(10) as Portfolio.Quantity
  },
  product: (quantities: Array<Portfolio.Quantity>) => {
    return quantities.reduce((result, quantity) => {
      const x = new BigNumber(result).times(new BigNumber(quantity))

      return x.toString(10) as Portfolio.Quantity
    }, '1' as Portfolio.Quantity)
  },
  quotient: (quantity1: Portfolio.Quantity, quantity2: Portfolio.Quantity) => {
    return new BigNumber(quantity1).dividedBy(new BigNumber(quantity2)).toString(10) as Portfolio.Quantity
  },
  isGreaterThan: (quantity1: Portfolio.Quantity, quantity2: Portfolio.Quantity) => {
    return new BigNumber(quantity1).isGreaterThan(new BigNumber(quantity2))
  },
  decimalPlaces: (quantity: Portfolio.Quantity, precision: number) => {
    return new BigNumber(quantity).decimalPlaces(precision).toString(10) as Portfolio.Quantity
  },
  denominated: (quantity: Portfolio.Quantity, denomination: number) => {
    return Quantities.quotient(quantity, new BigNumber(10).pow(denomination).toString(10) as Portfolio.Quantity)
  },
  integer: (quantity: Portfolio.Quantity, denomination: number) => {
    return new BigNumber(quantity).decimalPlaces(denomination).shiftedBy(denomination).toString(10) as Portfolio.Quantity
  },
  zero: '0' as Portfolio.Quantity,
  isZero: (quantity: Portfolio.Quantity) => new BigNumber(quantity).isZero(),
  isAtomic: (quantity: Portfolio.Quantity, denomination: number) => {
    const absoluteQuantity = new BigNumber(quantity).decimalPlaces(denomination).abs()
    const minimalFractionalPart = new BigNumber(10).pow(new BigNumber(denomination).negated())

    return absoluteQuantity.isEqualTo(minimalFractionalPart)
  },
  parseFromText: (text: string, precision: number, format: NumberLocale) => {
    const {decimalSeparator} = format
    const invalid = new RegExp(`[^0-9${decimalSeparator}]`, 'g')
    const sanitized = text === '' ? '0' : text.replaceAll(invalid, '')
    const parts = sanitized.split(decimalSeparator)
    const isDec = parts.length >= 2

    const fullDecValue = isDec ? `${parts[0]}${decimalSeparator}${parts[1].slice(0, precision)}1` : sanitized
    const fullDecFormat = new BigNumber(fullDecValue.replace(decimalSeparator, '.')).toFormat()
    const input = isDec ? fullDecFormat.slice(0, -1) : fullDecFormat

    const value = isDec ? `${parts[0]}${decimalSeparator}${parts[1].slice(0, precision)}` : sanitized
    const quantity = new BigNumber(value.replace(decimalSeparator, '.'))
      .decimalPlaces(precision)
      .shiftedBy(precision)
      .toString(10)

    return [input, quantity] as [string, Portfolio.Quantity]
  },
  format: (quantity: Portfolio.Quantity, denomination: number) => {
    return new BigNumber(Quantities.denominated(quantity, denomination)).toFormat()
  },
}

export const asQuantity = (value: BigNumber | number | string) => {
  const bn = new BigNumber(value)
  if (bn.isNaN() || !bn.isFinite()) {
    throw new Error('Invalid quantity')
  }
  return bn.toString(10) as Portfolio.Quantity
}

export const Utxos = {
  toAmounts: (utxos: RawUtxo[], primaryTokenId: TokenId) => {
    return utxos.reduce(
      (previousAmounts, currentUtxo) => {
        const amounts = {
          ...previousAmounts,
          [primaryTokenId]: Quantities.sum([previousAmounts[primaryTokenId], currentUtxo.amount as Portfolio.Quantity]),
        }

        if (currentUtxo.assets) {
          return currentUtxo.assets.reduce((previousAmountsWithAssets, currentAsset) => {
            return {
              ...previousAmountsWithAssets,
              [currentAsset.assetId]: Quantities.sum([
                Amounts.getAmount(previousAmountsWithAssets, currentAsset.assetId).quantity,
                currentAsset.amount as Portfolio.Quantity,
              ]),
            }
          }, amounts)
        }

        return amounts
      },
      {[primaryTokenId]: Quantities.zero} as Portfolio.Amounts,
    )
  },
}

export const compareArrays = <T>(array1: Array<T>, array2: Array<T>) => {
  if (array1.length !== array2.length) return false
  return array1.every((item, index) => item === array2[index])
}
