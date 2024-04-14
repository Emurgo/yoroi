import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {tokenInfoMocks} from './token-info.mocks'

const primaryETH: Portfolio.Token.Balance = {
  info: tokenInfoMocks.primaryETH,
  balance: BigInt(1_000_000),
  lockedInBuiltTxs: BigInt(0),
}

const primaryETHBreakdown: Portfolio.BalancePrimaryBreakdown = {
  ...primaryETH,
  minRequiredByTokens: BigInt(500_000),
  records: [
    {
      quantity: BigInt(1_000_000),
      redeemableAfter: new Date().getTime(),
      source: 'rewards',
    },
  ],
}

const missingToken: Portfolio.Token.Balance = {
  info: {...tokenInfoMocks.ftNameless, id: 'dead.fee'},
  balance: BigInt(1),
  lockedInBuiltTxs: BigInt(0),
}

const nftCryptoKitty: Portfolio.Token.Balance = {
  info: tokenInfoMocks.nftCryptoKitty,
  balance: BigInt(1_000_001),
  lockedInBuiltTxs: BigInt(100_001),
}

const rnftWhatever: Portfolio.Token.Balance = {
  info: tokenInfoMocks.rnftWhatever,
  balance: BigInt(2_000_002),
  lockedInBuiltTxs: BigInt(200_002),
}

const ftNoTicker: Portfolio.Token.Balance = {
  info: tokenInfoMocks.ftNoTicker,
  balance: BigInt(3_000_003),
  lockedInBuiltTxs: BigInt(300_003),
}

const ftNameless: Portfolio.Token.Balance = {
  info: tokenInfoMocks.ftNameless,
  balance: BigInt(4_000_004),
  lockedInBuiltTxs: BigInt(400_004),
}

const storage: {
  entries1: ReadonlyArray<[Portfolio.Token.Id, Portfolio.Token.Balance]>
  entries1WithPrimary: ReadonlyArray<
    [Portfolio.Token.Id, Portfolio.Token.Balance]
  >
  missingInApiResponse: ReadonlyArray<
    [Portfolio.Token.Id, Portfolio.Token.Balance]
  >
} = {
  entries1: [
    [nftCryptoKitty.info.id, nftCryptoKitty],
    [rnftWhatever.info.id, rnftWhatever],
    [ftNoTicker.info.id, ftNoTicker],
    [ftNameless.info.id, ftNameless],
  ],
  entries1WithPrimary: [
    [nftCryptoKitty.info.id, nftCryptoKitty],
    [rnftWhatever.info.id, rnftWhatever],
    [ftNoTicker.info.id, ftNoTicker],
    [ftNameless.info.id, ftNameless],
    [primaryETH.info.id, primaryETH],
  ],
  missingInApiResponse: [[missingToken.info.id, missingToken]],
}

export const tokenBalanceMocks = freeze({
  primaryETH,
  primaryETHBreakdown,
  nftCryptoKitty,
  rnftWhatever,
  ftNoTicker,
  ftNameless,

  storage,
})
