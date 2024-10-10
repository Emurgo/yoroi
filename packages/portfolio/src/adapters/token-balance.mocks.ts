import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {tokenInfoMocks} from './token-info.mocks'

const primaryETH: Portfolio.Token.Amount = {
  info: tokenInfoMocks.primaryETH,
  quantity: BigInt(1_000_000),
}

const primaryETHBreakdown: Portfolio.PrimaryBreakdown = {
  availableRewards: BigInt(1_000_001),
  totalFromTxs: BigInt(1_000_002),
  lockedAsStorageCost: BigInt(1_000_003),
}

const missingToken: Portfolio.Token.Amount = {
  info: {...tokenInfoMocks.ftNameless, id: 'dead.fee'},
  quantity: BigInt(1),
}

const nftCryptoKitty: Portfolio.Token.Amount = {
  info: tokenInfoMocks.nftCryptoKitty,
  quantity: BigInt(1_000_001),
}

const rnftWhatever: Portfolio.Token.Amount = {
  info: tokenInfoMocks.rnftWhatever,
  quantity: BigInt(2_000_002),
}

const ftNoTicker: Portfolio.Token.Amount = {
  info: tokenInfoMocks.ftNoTicker,
  quantity: BigInt(3_000_003),
}

const ftNameless: Portfolio.Token.Amount = {
  info: tokenInfoMocks.ftNameless,
  quantity: BigInt(4_000_004),
}

const storage: {
  entries1: ReadonlyArray<[Portfolio.Token.Id, Portfolio.Token.Amount]>
  entries1WithPrimary: ReadonlyArray<
    [Portfolio.Token.Id, Portfolio.Token.Amount]
  >
  missingInApiResponse: ReadonlyArray<
    [Portfolio.Token.Id, Portfolio.Token.Amount]
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
