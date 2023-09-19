import {Portfolio} from '@yoroi/types'

function getInfo(token: Readonly<Portfolio.Token>): Readonly<Portfolio.TokenInfo> {
  return token.info
}

export function getInfos(tokens: Portfolio.TokenRecords): ReadonlyArray<Readonly<Portfolio.TokenInfo>> {
  return Object.values(tokens).map(getInfo)
}

function getName(tokenInfo: Readonly<Portfolio.TokenInfo>) {
  switch (tokenInfo.kind) {
    case 'ft':
      return tokenInfo.ticker?.toLocaleLowerCase() ?? tokenInfo.name?.toLocaleLowerCase() ?? ''
    case 'nft':
      return tokenInfo.name?.toLocaleLowerCase() ?? ''
  }
}

// happens when the token has no assetName(only policyId) and no metadata
function isNameless(tokenInfo: Readonly<Portfolio.TokenInfo>) {
  switch (tokenInfo.kind) {
    case 'ft':
      return !tokenInfo.ticker && !tokenInfo.name
    case 'nft':
      return !tokenInfo.name
    default:
      return false
  }
}

export const sortBalanceRecordsByName = <M extends Record<string, unknown>>(
  balanceRecords: Portfolio.TokenBalanceRecords<M>,
): ReadonlyArray<[Portfolio.TokenInfo['id'], Readonly<Portfolio.Token<M>>]> =>
  Object.values(balanceRecords)
    .map(getInfo)
    .sort(alpha(getName))
    .sort(toEnd(isNameless))
    .map(({id}) => [id, balanceRecords[id]] as const)

// prettier-ignore
export const alpha = <T>(transform: Transform<T>)=>(a: T, b: T) => transform(a).localeCompare(transform(b))

// prettier-ignore
export const toEnd = <T>(predicate: (a: T) => boolean) => (a: T, b: T) => {
  return predicate(a) ? 1 : predicate(b) ? -1 : 0
}

// prettier-ignore
export const toStart = <T>(predicate: (a: T) => boolean) => (a: T, b: T) => {
  return predicate(a) ? -1 : predicate(b) ? 1 : 0
}

export function filterNftsEntries(
  tokens: ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.TokenBalance]>,
): ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.Token]> {
  return tokens.filter(([, token]) => token.info.kind === 'nft')
}

export function filterFtsEntries(
  tokens: ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.TokenBalance]>,
): ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.Token]> {
  return tokens.filter(([, token]) => token.info.kind === 'ft')
}

export function mergeRecords(...tokens: ReadonlyArray<Readonly<Portfolio.TokenRecords>>) {
  return tokens.reduce((acc, tokens) => ({...acc, ...tokens}), {})
}

type Transform<T> = (a: T) => string

export const Tokens = {
  getInfos,
  sortBalanceRecordsByName,
  filterFtsEntries,
  filterNftsEntries,
  mergeRecords,
} as const
