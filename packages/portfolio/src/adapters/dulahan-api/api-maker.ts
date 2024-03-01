import {FetchData, fetchData} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {
  ApiConfig,
  AppApiRequestRecordWithCache,
  PortfolioApi,
  PortfolioApiTokenDiscoveriesResponse,
  PortfolioApiTokenInfosResponse,
} from '../../types'

export const portfolioApiMaker = ({
  network,
  request = fetchData,
}: {
  network: Chain.Network
  request?: FetchData
}): PortfolioApi => {
  const config = apiConfig[network]
  return freeze(
    {
      tokenDiscoveries(ids) {
        return request<
          PortfolioApiTokenDiscoveriesResponse,
          ReadonlyArray<AppApiRequestRecordWithCache<Portfolio.Token.Id>>
        >({
          method: 'post',
          url: config.tokenDiscoveries,
          data: ids,
        })
      },
      tokenInfos(ids) {
        return request<
          PortfolioApiTokenInfosResponse,
          ReadonlyArray<AppApiRequestRecordWithCache<Portfolio.Token.Id>>
        >({
          method: 'post',
          url: config.tokenInfos,
          data: ids,
        })
      },
    },
    true,
  )
}

export const apiConfig: ApiConfig = freeze(
  {
    main: {
      tokenDiscoveries:
        'https://yoroi-backend-zero-mainnet.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
      tokenInfos:
        'https://yoroi-backend-zero-mainnet.emurgornd.com/dreps/{{DREP_ID}}/state',
    },
    preprod: {
      tokenDiscoveries:
        'https://yoroi-backend-zero-mainnet.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
      tokenInfos:
        'https://yoroi-backend-zero-mainnet.emurgornd.com/dreps/{{DREP_ID}}/state',
    },
    preview: {
      tokenDiscoveries:
        'https://yoroi-backend-zero-mainnet.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
      tokenInfos:
        'https://yoroi-backend-zero-mainnet.emurgornd.com/dreps/{{DREP_ID}}/state',
    },
    sancho: {
      tokenDiscoveries:
        'https://yoroi-backend-zero-mainnet.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
      tokenInfos:
        'https://yoroi-backend-zero-mainnet.emurgornd.com/dreps/{{DREP_ID}}/state',
    },
    test: {
      tokenDiscoveries:
        'https://yoroi-backend-zero-mainnet.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
      tokenInfos:
        'https://yoroi-backend-zero-mainnet.emurgornd.com/dreps/{{DREP_ID}}/state',
    },
  },
  true,
)
