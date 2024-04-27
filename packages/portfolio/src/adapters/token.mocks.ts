import {freeze} from 'immer'

import * as infos from './token-info.mocks'
import * as discoveries from './token-discovery.mocks'
import * as balances from './token-balance.mocks'

export const tokenMocks = freeze(
  {
    nftCryptoKitty: {
      info: infos.tokenInfoMocks.nftCryptoKitty,
      discovery: discoveries.tokenDiscoveryMocks.nftCryptoKitty,
      balance: balances.tokenBalanceMocks.nftCryptoKitty,
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
    },
    apiResponse: {
      tokenInfos: infos.tokenInfoMocks.apiResponseResult,
      tokenDiscoveries: discoveries.tokenDiscoveryMocks.apiResponseResult,
    },
    apiRequest: {
      tokenInfos: infos.tokenInfoMocks.apiRequestArgs,
      tokenDiscoveries: discoveries.tokenDiscoveryMocks.apiRequestArgs,
    },
  },
  true,
)
