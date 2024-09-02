import {isPrimaryToken} from '@yoroi/portfolio'
import {Balance} from '@yoroi/types'

export const sortTokenInfos = ({tokenInfos}: {tokenInfos: Balance.TokenInfo[]}): Balance.TokenInfo[] =>
  tokenInfos
    .sort(
      alpha((tokenInfo) => {
        switch (tokenInfo.kind) {
          case 'ft':
            return tokenInfo.ticker?.toLocaleLowerCase() ?? tokenInfo.name?.toLocaleLowerCase() ?? ''
          case 'nft':
            return tokenInfo.name?.toLocaleLowerCase() ?? ''
        }
      }),
    )
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
    .sort(toStart((tokenInfo) => isPrimaryToken(tokenInfo.id)))

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

type Transform<T> = (a: T) => string
