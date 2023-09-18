import {Balance} from '@yoroi/types'

export function getId(token: Balance.Token) {
  return token.info.id
}

export function getInfo(token: Balance.Token) {
  return token.info
}

export function getInfos(tokens: Balance.TokenRecords) {
  return Object.values(tokens).map(getInfo)
}

export const sort = (
  tokens: Readonly<Balance.TokenRecords>,
): ReadonlyArray<[Balance.TokenInfo['id'], Readonly<Balance.Token>]> =>
  Object.values(tokens)
    .map(getInfo)
    .sort(alpha(getNameFromInfo))
    .sort(
      toEnd((tokenInfo) => {
        switch (tokenInfo.kind) {
          case 'ft':
            return !tokenInfo.ticker && !tokenInfo.name
          case 'nft':
            return !tokenInfo.name
        }
      }),
    )
    .map(({id}) => [id, tokens[id]] as const)

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

const getNameFromInfo = (tokenInfo: Balance.TokenInfo) => {
  switch (tokenInfo.kind) {
    case 'ft':
      return tokenInfo.ticker?.toLocaleLowerCase() ?? tokenInfo.name?.toLocaleLowerCase() ?? ''
    case 'nft':
      return tokenInfo.name?.toLocaleLowerCase() ?? ''
  }
}

export function filterNftsEntries(
  tokens: ReadonlyArray<[Balance.TokenInfo['id'], Balance.Token]>,
): ReadonlyArray<[Balance.TokenInfo['id'], Balance.Token]> {
  return tokens.filter(([, token]) => token.info.kind === 'nft')
}

export function filterFtsEntries(
  tokens: ReadonlyArray<[Balance.TokenInfo['id'], Balance.Token]>,
): ReadonlyArray<[Balance.TokenInfo['id'], Balance.Token]> {
  return tokens.filter(([, token]) => token.info.kind === 'ft')
}

export function mergeRecords(
  ...tokens: ReadonlyArray<Readonly<Balance.TokenRecords>> 
) {
  return tokens.reduce((acc, tokens) => ({...acc, ...tokens}), {})
}

type Transform<T> = (a: T) => string

export const Tokens = {
  getId,
  getInfo,
  getInfos,
  sort,
  filterFtsEntries,
  filterNftsEntries,
  mergeRecords,
} as const
