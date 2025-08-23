import {Portfolio} from '@yoroi/types'

export const alpha =
  <T>(transform: Transform<T>) =>
  (a: T, b: T) =>
    transform(a).localeCompare(transform(b))

export const toEnd =
  <T>(predicate: (a: T) => boolean) =>
  (a: T, b: T) =>
    predicate(a) ? 1 : predicate(b) ? -1 : 0

export const toStart =
  <T>(predicate: (a: T) => boolean) =>
  (a: T, b: T) =>
    predicate(a) ? -1 : predicate(b) ? 1 : 0

export const sortTokenInfos = ({
  primaryTokenInfo,
  secondaryTokenInfos,
}: {
  primaryTokenInfo: Readonly<Portfolio.Token.Info>
  secondaryTokenInfos: ReadonlyArray<Portfolio.Token.Info>
}): ReadonlyArray<Portfolio.Token.Info> =>
  [...secondaryTokenInfos]
    .sort(
      alpha<Portfolio.Token.Info>((tokenInfo) => {
        switch (tokenInfo.type) {
          case Portfolio.Token.Type.FT: {
            if (tokenInfo.ticker !== '')
              return tokenInfo.ticker.toLocaleLowerCase()
            return tokenInfo.name.toLocaleLowerCase()
          }
          case Portfolio.Token.Type.NFT:
            return tokenInfo.name.toLocaleLowerCase()
        }
      }),
    )
    .sort(
      toEnd<Portfolio.Token.Info>((tokenInfo) => {
        switch (tokenInfo.status) {
          case Portfolio.Token.Status.Unknown:
          case Portfolio.Token.Status.Invalid:
          case Portfolio.Token.Status.Scam:
            return true
        }

        switch (tokenInfo.type) {
          case Portfolio.Token.Type.FT:
            return !tokenInfo.ticker && !tokenInfo.name
          case Portfolio.Token.Type.NFT:
            return !tokenInfo.name
        }
      }),
    )
    .sort(toStart((tokenInfo) => tokenInfo.id === primaryTokenInfo.id))

export const sortTokenAmountsByInfo = ({
  primaryTokenInfo,
  amounts,
}: {
  primaryTokenInfo: Readonly<Portfolio.Token.Info>
  amounts: ReadonlyArray<Portfolio.Token.Amount>
}): ReadonlyArray<Portfolio.Token.Amount> =>
  [...amounts]
    .sort(
      alpha<Portfolio.Token.Amount>((tokenBalance) => {
        switch (tokenBalance.info.type) {
          case Portfolio.Token.Type.FT: {
            if (tokenBalance.info.ticker !== '')
              return tokenBalance.info.ticker.toLocaleLowerCase()
            return tokenBalance.info.name.toLocaleLowerCase()
          }
          case Portfolio.Token.Type.NFT:
            return tokenBalance.info.name.toLocaleLowerCase()
        }
      }),
    )
    .sort(
      toEnd<Portfolio.Token.Amount>((tokenBalance) => {
        switch (tokenBalance.info.status) {
          case Portfolio.Token.Status.Unknown:
          case Portfolio.Token.Status.Invalid:
          case Portfolio.Token.Status.Scam:
            return true
        }

        switch (tokenBalance.info.type) {
          case Portfolio.Token.Type.FT:
            return !tokenBalance.info.ticker && !tokenBalance.info.name
          case Portfolio.Token.Type.NFT:
            return !tokenBalance.info.name
        }
      }),
    )
    .sort(
      toStart((tokenBalance) => tokenBalance.info.id === primaryTokenInfo.id),
    )

type Transform<T> = (a: T) => string
