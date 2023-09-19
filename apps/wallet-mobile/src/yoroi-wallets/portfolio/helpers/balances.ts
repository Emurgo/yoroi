import {Portfolio, Writable} from '@yoroi/types'

import {asQuantity} from '../../utils'
import {alpha, getInfo, getName, isNameless, toEnd} from './tokens'

// RECORDS
export const sortByName = <T extends Portfolio.Token>(
  balanceRecords: Portfolio.TokenBalanceRecords<T>,
): ReadonlyArray<[T['info']['id'], Portfolio.TokenBalance<T>]> =>
  Object.values(balanceRecords)
    .map(getInfo<T>)
    .sort(alpha(getName<T>))
    .sort(toEnd(isNameless<T>))
    .map(({id}) => [id, balanceRecords[id]])

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

export function asAmounts<T extends Portfolio.Token>(
  tokenBalanceEntries: ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.TokenBalance<T>]>,
): Readonly<Portfolio.Amounts> {
  const amounts: Writable<Portfolio.Amounts> = {}
  tokenBalanceEntries.forEach(([id, tokenBalance]) => {
    amounts[id] = asQuantity(tokenBalance.balance)
  })
  return {...amounts} as const
}

export const Balances = {
  sortByName,
  filterByName,
  filterByNfts,
  filterByFts,
  findById,
  asAmounts,
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
