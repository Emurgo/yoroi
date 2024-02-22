import {freeze} from 'immer'

import * as infos from './token-info.mocks'
import * as discoveries from './token-discovery.mocks'

export const tokenMocks = freeze(
  {
    nftCryptoKitty: {
      info: infos.tokenInfoMocks.nftCryptoKitty,
      discovery: discoveries.tokenDiscoveryMocks.nftCryptoKitty,
    },
    primaryETH: {
      info: infos.tokenInfoMocks.primaryETH,
      discovery: discoveries.tokenDiscoveryMocks.primaryETH,
    },
    rnftWhatever: {
      info: infos.tokenInfoMocks.rnftWhatever,
      discovery: discoveries.tokenDiscoveryMocks.rnftWhatever,
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
