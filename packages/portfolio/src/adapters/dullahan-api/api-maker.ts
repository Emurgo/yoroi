import {FetchData, fetchData, isLeft} from '@yoroi/common'
import {Api, Chain, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {ApiConfig} from '../../types'
import {toDullahanRequest, toSecondaryTokenInfos} from './transformers'
import {
  DullahanApiCachedIdsRequest,
  DullahanApiTokenInfosResponse,
} from './types'

export const portfolioApiMaker = ({
  network,
  request = fetchData,
}: {
  network: Chain.SupportedNetworks
  request?: FetchData
}): Portfolio.Api.Api => {
  const config = apiConfig[network]
  return freeze(
    {
      async tokenDiscoveries(idsWithCache) {
        return request<
          Portfolio.Api.TokenDiscoveriesResponse,
          DullahanApiCachedIdsRequest
        >({
          method: 'post',
          url: config.tokenDiscoveries,
          data: toDullahanRequest(idsWithCache),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })
      },
      async tokenInfos(idsWithCache) {
        const response = await request<
          DullahanApiTokenInfosResponse,
          DullahanApiCachedIdsRequest
        >({
          method: 'post',
          url: config.tokenInfos,
          data: toDullahanRequest(idsWithCache),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })
        if (isLeft(response)) return response

        const transformedResponseData = toSecondaryTokenInfos(
          response.value.data,
        )

        const transformedResponse: Api.Response<Portfolio.Api.TokenInfosResponse> =
          freeze(
            {
              tag: 'right',
              value: {
                status: response.value.status,
                data: transformedResponseData,
              },
            },
            true,
          )

        return transformedResponse
      },
    },
    true,
  )
}

export const apiConfig: ApiConfig = freeze(
  {
    mainnet: {
      tokenDiscoveries:
        'https://add50d9d-76d7-47b7-b17f-e34021f63a02.mock.pstmn.io/v1/token-discoveries',
      tokenInfos:
        'https://dev-yoroi-backend-zero-mainnet.emurgornd.com/tokens/info/multi',
    },
    preprod: {
      tokenDiscoveries:
        'https://add50d9d-76d7-47b7-b17f-e34021f63a02.mock.pstmn.io/v1/token-discoveries',
      tokenInfos:
        'https://dev-yoroi-backend-zero-preprod.emurgornd.com/tokens/info/multi',
    },
    sancho: {
      tokenDiscoveries:
        'https://yoroi-backend-zero-mainnet.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
      tokenInfos:
        'https://yoroi-backend-zero-mainnet.emurgornd.com/dreps/{{DREP_ID}}/state',
    },
  },
  true,
)
