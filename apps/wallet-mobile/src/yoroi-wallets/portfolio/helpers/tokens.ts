import {Portfolio} from '@yoroi/types'

export function getInfo<T extends Portfolio.Token>(token: T): T['info'] {
  return token.info
}

export function getInfos<T extends Portfolio.Token>(tokens: Portfolio.TokenRecords<T>): ReadonlyArray<T['info']> {
  return Object.values(tokens).map(getInfo<T>)
}

export function getName<T extends Portfolio.Token>(tokenInfo: Readonly<T['info']>) {
  if (tokenInfo.kind === 'nft') return tokenInfo.name?.toLocaleLowerCase() ?? ''

  return tokenInfo.ticker?.toLocaleLowerCase() ?? tokenInfo.name?.toLocaleLowerCase() ?? ''
}

// happens when the token has no assetName(only policyId) and no metadata
export function isNameless<T extends Portfolio.Token>(tokenInfo: Readonly<T['info']>) {
  if (tokenInfo.kind === 'nft') return !tokenInfo.name

  return !tokenInfo.ticker && !tokenInfo.name
}

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

export function mergeRecords<T extends Portfolio.Token>(...tokens: ReadonlyArray<Portfolio.TokenRecords<T>>) {
  return tokens.reduce((acc, tokens) => ({...acc, ...tokens}), {})
}

type Transform<T> = (a: T) => string
