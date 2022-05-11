import BigNumber from 'bignumber.js'

import {YoroiEntry} from './types'

export const sumEntries = (entries: Array<YoroiEntry>) =>
  entries
    .map((entry) => Object.entries(entry))
    .flat()
    .reduce(
      (result, [tokenId, amount]) => ({
        ...result,
        [tokenId]: new BigNumber(result[tokenId] || 0).plus(new BigNumber(amount)).toString(),
      }),
      {} as YoroiEntry,
    )

export const diffEntries = (entry1: YoroiEntry, entry2: YoroiEntry) =>
  sumEntries([
    entry1,
    Object.entries(entry2).reduce(
      (result, [tokenId, amount]) => ({...result, [tokenId]: negated(amount)}),
      {} as YoroiEntry,
    ),
  ])

export const negated = (amount: string) => new BigNumber(amount).negated().toString()
