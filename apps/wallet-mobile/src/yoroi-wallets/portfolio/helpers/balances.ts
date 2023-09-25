import {Portfolio, Writable} from '@yoroi/types'

import {asQuantity} from '../../utils'
import {alpha, getInfo, getNameInLowercase, isNameless, toEnd} from './tokens'

// RECORDS
export const sortByName = <T extends Portfolio.Token>(
  tokenBalanceRecords: Portfolio.TokenBalanceRecords<T>,
): ReadonlyArray<[T['info']['id'], Portfolio.TokenBalance<T>]> =>
  Object.values(tokenBalanceRecords)
    .map(getInfo<T>)
    .sort(alpha(getNameInLowercase<T>))
    .sort(toEnd(isNameless<T>))
    .map(({id}) => [id, tokenBalanceRecords[id]])

// ENTRIES
export function filterByNfts<T extends Portfolio.Token>(
  tokenBalanceEntries: ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.TokenBalance<T>]>,
): ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.TokenBalance<T>]> {
  return tokenBalanceEntries.filter(isNft)
}

export function filterByFts<T extends Portfolio.Token>(
  tokenBalanceEntries: ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.TokenBalance<T>]>,
): ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.TokenBalance<T>]> {
  return tokenBalanceEntries.filter(isFt)
}

export function findById<T extends Portfolio.Token>(
  tokenBalanceEntries: ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.TokenBalance<T>]>,
  id: Portfolio.TokenInfo['id'],
): [Portfolio.TokenInfo['id'], Portfolio.TokenBalance<T>] | undefined {
  const findById = byId(id)
  return tokenBalanceEntries.find(findById)
}

export function filterByName<T extends Portfolio.Token>(
  tokenBalanceEntries: ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.TokenBalance<T>]>,
  searchTerm: string,
): ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.TokenBalance<T>]> {
  const filterByName = byName(searchTerm)
  const results = searchTerm.length > 0 ? tokenBalanceEntries.filter(filterByName) : tokenBalanceEntries
  return results
}

export function toAmounts<T extends Portfolio.Token>(
  tokenBalanceEntries: ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.TokenBalance<T>]>,
): Readonly<Portfolio.Amounts> {
  const amounts: Writable<Portfolio.Amounts> = {}
  tokenBalanceEntries.forEach(([id, tokenBalance]) => {
    amounts[id] = asQuantity(tokenBalance.balance.quantity)
  })
  return {...amounts} as const
}

export const Balances = {
  sortByName,
  filterByName,
  filterByNfts,
  filterByFts,
  findById,
  toAmounts,
} as const

export function isNft<T extends Portfolio.Token>([_, tokenBalance]: [string, Portfolio.TokenBalance<T>]): boolean {
  return tokenBalance.info.kind === 'nft'
}

export function isFt<T extends Portfolio.Token>([_, tokenBalance]: [string, Portfolio.TokenBalance<T>]): boolean {
  return tokenBalance.info.kind === 'ft'
}

export function byName<T extends Portfolio.Token>(searchTerm: string) {
  return ([_, tokenBalance]: [string, Portfolio.TokenBalance<T>]) =>
    tokenBalance.info.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
}

export function byId<T extends Portfolio.Token>(id: string) {
  return ([tokenId, _]: [string, Portfolio.TokenBalance<T>]) => tokenId === id
}
