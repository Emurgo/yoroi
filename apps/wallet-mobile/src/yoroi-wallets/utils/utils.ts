import {Balance} from '@yoroi/types'
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
  toAmounts: (entries: YoroiEntries): Balance.Amounts => {
    const amounts = Object.values(entries)

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
  formatFromText: (input: string, precision: number, format: NumberLocale) => {
    const {decimalSeparator} = format
    const invalid = new RegExp(`[^0-9${decimalSeparator}]`, 'g')
    const sanitized = input === '' ? '0' : input.replaceAll(invalid, '')
    const parts = sanitized.split(decimalSeparator)

    const valid = parts.length >= 2 ? `${parts[0]}${decimalSeparator}${parts[1].slice(0, precision)}` : sanitized

    const trailing = valid.slice(-1) === decimalSeparator

    const quantity = new BigNumber(valid.replace(format.decimalSeparator, '.')).toString(10)

    const formatted = `${new BigNumber(quantity).toFormat()}${trailing ? decimalSeparator : ''}`

    return [formatted, quantity] as [string, Balance.Quantity]
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
