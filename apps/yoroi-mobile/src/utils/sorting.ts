import {YoroiWallet} from '../yoroi-wallets/cardano/types'
import {TokenInfo} from '../yoroi-wallets/types'

export const sortTokenInfos = ({wallet, tokenInfos}: {wallet: YoroiWallet; tokenInfos: Array<TokenInfo>}) =>
  tokenInfos
    .sort(alpha((tokenInfo) => tokenInfo.ticker?.toLocaleLowerCase() ?? tokenInfo.name?.toLocaleLowerCase() ?? ''))
    .sort(toEnd((tokenInfo) => !tokenInfo.name && !tokenInfo.ticker))
    .sort(toStart((tokenInfo) => tokenInfo.id === wallet.primaryTokenInfo.id))

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
