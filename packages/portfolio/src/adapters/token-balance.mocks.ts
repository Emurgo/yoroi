import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {tokenInfoMocks} from './token-info.mocks'

const primaryETH: Portfolio.Token.Balance = {
  info: tokenInfoMocks.primaryETH,
  balance: BigInt(1_000_000),
  lockedInBuiltTxs: BigInt(0),
}

const nftCryptoKitty: Portfolio.Token.Balance = {
  info: tokenInfoMocks.nftCryptoKitty,
  balance: BigInt(1),
  lockedInBuiltTxs: BigInt(0),
}

const rnftWhatever: Portfolio.Token.Balance = {
  info: tokenInfoMocks.rnftWhatever,
  balance: BigInt(1_000_000),
  lockedInBuiltTxs: BigInt(0),
}

const ftNoTicker: Portfolio.Token.Balance = {
  info: tokenInfoMocks.ftNoTicker,
  balance: BigInt(1_000_000),
  lockedInBuiltTxs: BigInt(0),
}

const ftNameless: Portfolio.Token.Balance = {
  info: tokenInfoMocks.ftNameless,
  balance: BigInt(1_000_000),
  lockedInBuiltTxs: BigInt(0),
}

const tokenBalanceStorage: ReadonlyArray<
  [Portfolio.Token.Id, Portfolio.Token.Balance]
> = [
  [nftCryptoKitty.info.id, nftCryptoKitty],
  [rnftWhatever.info.id, rnftWhatever],
  [ftNoTicker.info.id, ftNoTicker],
  [ftNameless.info.id, ftNameless],
]

export const tokenBalanceMocks = freeze({
  primaryETH,
  nftCryptoKitty,
  rnftWhatever,
  ftNoTicker,
  ftNameless,

  tokenBalanceStorage,
})
