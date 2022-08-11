import BigNumber from 'bignumber.js'

import {RawUtxo} from '../legacy/types'
import {Quantity, TokenId, YoroiAmount, YoroiAmounts, YoroiEntries, YoroiEntry} from './types'

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
      quantity: amounts[tokenId] || '0',
    }
  },
}

export const Quantities = {
  sum: (quantities: Array<Quantity>) => {
    return quantities.reduce((result, current) => result.plus(current), new BigNumber(0)).toString() as Quantity
  },
  diff: (quantity1: Quantity, quantity2: Quantity) => {
    return new BigNumber(quantity1).minus(new BigNumber(quantity2)).toString() as Quantity
  },
  negated: (quantity: Quantity) => {
    return new BigNumber(quantity).negated().toString() as Quantity
  },
  product: (quantities: Array<Quantity>) => {
    return quantities.reduce((result, quantity) => {
      const x = new BigNumber(result).times(new BigNumber(quantity))

      return x.toString() as Quantity
    }, '1' as Quantity)
  },
  quotient: (quantity1: Quantity, quantity2: Quantity) => {
    return new BigNumber(quantity1).dividedBy(new BigNumber(quantity2)).toString() as Quantity
  },
  isGreaterThan: (quantity1: Quantity, quantity2: Quantity) =>
    new BigNumber(quantity1).isGreaterThan(new BigNumber(quantity2)),
}

export const Utxos = {
  toAmounts: (utxos: RawUtxo[], primaryTokenId: TokenId) => {
    return utxos.reduce(
      (amounts, current) => {
        amounts[primaryTokenId] = Quantities.sum([amounts[primaryTokenId], current.amount as Quantity])

        if (current.assets) {
          for (const asset of current.assets) {
            amounts[asset.assetId] = Quantities.sum([
              amounts[asset.assetId] ?? ('0' as Quantity),
              asset.amount as Quantity,
            ])
          }
        }

        return amounts
      },
      {[primaryTokenId]: '0'} as YoroiAmounts,
    )
  },
}
