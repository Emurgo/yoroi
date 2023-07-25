import BigNumber from 'bignumber.js'

import {Quantity, RawUtxo, TokenId, YoroiAmount, YoroiAmounts, YoroiEntries, YoroiEntry} from '../types'

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
  toAmounts: (entries: YoroiEntries): YoroiAmounts => {
    const amounts = Object.values(entries)

    return Amounts.sum(amounts)
  },
}

export const Amounts = {
  sum: (amounts: Array<YoroiAmounts>): YoroiAmounts => {
    const entries = amounts.map((amounts) => Object.entries(amounts)).flat()

    return entries.reduce(
      (result, [tokenId, quantity]) => ({
        ...result,
        [tokenId]: result[tokenId] ? Quantities.sum([result[tokenId], quantity]) : quantity,
      }),
      {} as YoroiAmounts,
    )
  },
  diff: (amounts1: YoroiAmounts, amounts2: YoroiAmounts): YoroiAmounts => {
    return Amounts.sum([amounts1, Amounts.negated(amounts2)])
  },
  includes: (amounts: YoroiAmounts, tokenId: string): boolean => {
    return Object.keys(amounts).includes(tokenId)
  },
  negated: (amounts: YoroiAmounts): YoroiAmounts => {
    const entries = Object.entries(amounts)
    const negatedEntries = entries.map(([tokenId, amount]) => [tokenId, Quantities.negated(amount)])

    return Object.fromEntries(negatedEntries)
  },
  remove: (amounts: YoroiAmounts, removeTokenIds: Array<TokenId>): YoroiAmounts => {
    const filteredEntries = Object.entries(amounts).filter(([tokenId]) => !removeTokenIds.includes(tokenId))

    return Object.fromEntries(filteredEntries)
  },
  getAmount: (amounts: YoroiAmounts, tokenId: string): YoroiAmount => {
    return {
      tokenId,
      quantity: amounts[tokenId] || Quantities.zero,
    }
  },
  save: (amounts: YoroiAmounts, amount: YoroiAmount): YoroiAmounts => {
    const {tokenId, quantity} = amount

    return {
      ...amounts,
      [tokenId]: quantity,
    }
  },
  map: (amounts: YoroiAmounts, fn: (amount: YoroiAmount) => YoroiAmount): YoroiAmounts =>
    Amounts.fromArray(Amounts.toArray(amounts).map(fn)),
  toArray: (amounts: YoroiAmounts) =>
    Object.keys(amounts).reduce(
      (result, current) => [...result, Amounts.getAmount(amounts, current)],
      [] as Array<YoroiAmount>,
    ),
  fromArray: (amounts: Array<YoroiAmount>) =>
    Object.fromEntries(amounts.map((amount) => [amount.tokenId, amount.quantity])),
}

export const Quantities = {
  sum: (quantities: Array<Quantity>) => {
    return quantities.reduce((result, current) => result.plus(current), new BigNumber(0)).toString(10) as Quantity
  },
  max: (...quantities: Array<Quantity>) => {
    return BigNumber.max(...quantities).toString(10) as Quantity
  },
  diff: (quantity1: Quantity, quantity2: Quantity) => {
    return new BigNumber(quantity1).minus(new BigNumber(quantity2)).toString(10) as Quantity
  },
  negated: (quantity: Quantity) => {
    return new BigNumber(quantity).negated().toString(10) as Quantity
  },
  product: (quantities: Array<Quantity>) => {
    return quantities.reduce((result, quantity) => {
      const x = new BigNumber(result).times(new BigNumber(quantity))

      return x.toString(10) as Quantity
    }, '1' as Quantity)
  },
  quotient: (quantity1: Quantity, quantity2: Quantity) => {
    return new BigNumber(quantity1).dividedBy(new BigNumber(quantity2)).toString(10) as Quantity
  },
  isGreaterThan: (quantity1: Quantity, quantity2: Quantity) => {
    return new BigNumber(quantity1).isGreaterThan(new BigNumber(quantity2))
  },
  decimalPlaces: (quantity: Quantity, precision: number) => {
    return new BigNumber(quantity).decimalPlaces(precision).toString(10) as Quantity
  },
  denominated: (quantity: Quantity, denomination: number) => {
    return Quantities.quotient(quantity, new BigNumber(10).pow(denomination).toString(10) as Quantity)
  },
  integer: (quantity: Quantity, denomination: number) => {
    return new BigNumber(quantity).decimalPlaces(denomination).shiftedBy(denomination).toString(10) as Quantity
  },
  zero: '0' as Quantity,
  isZero: (quantity: Quantity) => new BigNumber(quantity).isZero(),
  isAtomic: (quantity: Quantity, denomination: number) => {
    const absoluteQuantity = new BigNumber(quantity).decimalPlaces(denomination).abs()
    const minimalFractionalPart = new BigNumber(10).pow(new BigNumber(denomination).negated())

    return absoluteQuantity.isEqualTo(minimalFractionalPart)
  },
}

export const asQuantity = (value: BigNumber | number | string) => {
  const bn = new BigNumber(value)
  if (bn.isNaN() || !bn.isFinite()) {
    throw new Error('Invalid quantity')
  }
  return bn.toString(10) as Quantity
}

export const Utxos = {
  toAmounts: (utxos: RawUtxo[], primaryTokenId: TokenId) => {
    return utxos.reduce(
      (previousAmounts, currentUtxo) => {
        const amounts = {
          ...previousAmounts,
          [primaryTokenId]: Quantities.sum([previousAmounts[primaryTokenId], currentUtxo.amount as Quantity]),
        }

        if (currentUtxo.assets) {
          return currentUtxo.assets.reduce((previousAmountsWithAssets, currentAsset) => {
            return {
              ...previousAmountsWithAssets,
              [currentAsset.assetId]: Quantities.sum([
                Amounts.getAmount(previousAmountsWithAssets, currentAsset.assetId).quantity,
                currentAsset.amount as Quantity,
              ]),
            }
          }, amounts)
        }

        return amounts
      },
      {[primaryTokenId]: Quantities.zero} as YoroiAmounts,
    )
  },
}

export const compareArrays = <T>(array1: Array<T>, array2: Array<T>) => {
  if (array1.length !== array2.length) return false
  return array1.every((item, index) => item === array2[index])
}
