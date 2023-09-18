import {Portfolio} from '@yoroi/types'

function getInfo(token: Portfolio.Token) {
  return token.info
}

export function getInfos(tokens: Portfolio.TokenRecords) {
  return Object.values(tokens).map(getInfo)
}

function getName(tokenInfo: Portfolio.TokenInfo) {
  switch (tokenInfo.kind) {
    case 'ft':
      return tokenInfo.ticker?.toLocaleLowerCase() ?? tokenInfo.name?.toLocaleLowerCase() ?? ''
    case 'nft':
      return tokenInfo.name?.toLocaleLowerCase() ?? ''
  }
}

export const sort = (
  tokens: Readonly<Portfolio.TokenRecords>,
): ReadonlyArray<[Portfolio.TokenInfo['id'], Readonly<Portfolio.Token>]> =>
  Object.values(tokens)
    .map(getInfo)
    .sort(alpha(getName))
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

export function filterNftsEntries(
  tokens: ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.Token]>,
): ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.Token]> {
  return tokens.filter(([, token]) => token.info.kind === 'nft')
}

export function filterFtsEntries(
  tokens: ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.Token]>,
): ReadonlyArray<[Portfolio.TokenInfo['id'], Portfolio.Token]> {
  return tokens.filter(([, token]) => token.info.kind === 'ft')
}

export function mergeRecords(...tokens: ReadonlyArray<Readonly<Portfolio.TokenRecords>>) {
  return tokens.reduce((acc, tokens) => ({...acc, ...tokens}), {})
}

type Transform<T> = (a: T) => string

export const Tokens = {
  getInfos,
  sort,
  filterFtsEntries,
  filterNftsEntries,
  mergeRecords,
} as const
