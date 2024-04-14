import {FetchData, fetchData, isLeft} from '@yoroi/common'
import {Api, Chain, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {ApiConfig} from '../../types'
import {toSecondaryTokenInfos} from './transformers'
import {DullahanApiTokenInfosResponse} from './types'

export const portfolioApiMaker = ({
  network,
  request = fetchData,
}: {
  network: Chain.Network
  request?: FetchData
}): Portfolio.Api.Api => {
  const config = apiConfig[network]
  return freeze(
    {
      tokenDiscoveries(idsWithCache) {
        return request<
          Portfolio.Api.TokenDiscoveriesResponse,
          ReadonlyArray<Api.RequestWithCache<Portfolio.Token.Id>>
        >({
          method: 'post',
          url: config.tokenDiscoveries,
          data: idsWithCache,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })
      },
      tokenInfos(idsWithCache) {
        return request<
          DullahanApiTokenInfosResponse,
          ReadonlyArray<Api.RequestWithCache<Portfolio.Token.Id>>
        >({
          method: 'post',
          url: config.tokenInfos,
          data: idsWithCache,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }).then((response) => {
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
        'https://add50d9d-76d7-47b7-b17f-e34021f63a02.mock.pstmn.io/v1/token-discoveries',
      tokenInfos:
        'https://national-brightly-iguana.ngrok-free.app/v1/token-infos',
    },
    preprod: {
      tokenDiscoveries:
        'https://add50d9d-76d7-47b7-b17f-e34021f63a02.mock.pstmn.io/v1/token-discoveries',
      tokenInfos:
        'https://national-brightly-iguana.ngrok-free.app/v1/token-infos',
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
