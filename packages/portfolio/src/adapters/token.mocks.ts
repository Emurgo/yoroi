import {freeze} from 'immer'

import * as infos from './token-info.mocks'
import * as discoveries from './token-discovery.mocks'
import * as balances from './token-balance.mocks'
import * as traits from './token-traits.mocks'

export const tokenMocks = freeze(
  {
    nftCryptoKitty: {
      info: infos.tokenInfoMocks.nftCryptoKitty,
      discovery: discoveries.tokenDiscoveryMocks.nftCryptoKitty,
      balance: balances.tokenBalanceMocks.nftCryptoKitty,
      traits: traits.tokenTraitsMocks.nftCryptoKitty,
    },
    primaryETH: {
      info: infos.tokenInfoMocks.primaryETH,
      discovery: discoveries.tokenDiscoveryMocks.primaryETH,
      balance: balances.tokenBalanceMocks.primaryETH,
      primaryBalanceBreakdown: balances.tokenBalanceMocks.primaryETHBreakdown,
    },
    rnftWhatever: {
      info: infos.tokenInfoMocks.rnftWhatever,
      discovery: discoveries.tokenDiscoveryMocks.rnftWhatever,
      balance: balances.tokenBalanceMocks.rnftWhatever,
      traits: traits.tokenTraitsMocks.rnftWhatever,
    },
    apiResponse: {
      tokenInfos: infos.tokenInfoMocks.apiResponseResult,
      tokenDiscovery: discoveries.tokenDiscoveryMocks.apiResponseResult,
    },
    apiRequest: {
      tokenInfos: infos.tokenInfoMocks.apiRequestArgs,
      tokenDiscovery: discoveries.tokenDiscoveryMocks.apiRequestArgs,
    },
  },
  true,
)
