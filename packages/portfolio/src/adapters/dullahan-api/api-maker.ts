import {FetchData, fetchData, isLeft, isRight} from '@yoroi/common'
import {Api, Chain, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {ApiConfig} from '../../types'
import {toDullahanRequest, toSecondaryTokenInfos} from './transformers'
import {
  DullahanApiCachedIdsRequest,
  DullahanApiTokenDiscoveryResponse,
  DullahanApiTokenInfosResponse,
} from './types'
import {parseTokenDiscovery} from '../../validators/token-discovery'

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
      async tokenDiscovery(id) {
        const response = await request<DullahanApiTokenDiscoveryResponse>({
          method: 'get',
          url: `${config.tokenDiscovery}/${id}`,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })
        if (isRight(response)) {
          const discovery: Portfolio.Token.Discovery | undefined =
            parseTokenDiscovery(response.value.data)

          if (!discovery) {
            return freeze(
              {
                tag: 'left',
                error: {
                  status: -3,
                  message: 'Failed to transform token discovery response',
                  responseData: response.value.data,
                },
              },
              true,
            )
          }

          return freeze(
            {
              tag: 'right',
              value: {
                status: response.value.status,
                data: discovery,
              },
            },
            true,
          )
        }

        return response
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

        try {
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
        } catch (error) {
          return freeze(
            {
              tag: 'left',
              error: {
                status: -3,
                message: 'Failed to transform token infos response',
                responseData: response.value.data,
              },
            },
            true,
          )
        }
      },
    },
    true,
  )
}

export const apiConfig: ApiConfig = freeze(
  {
    mainnet: {
      tokenDiscovery:
        'https://dev-yoroi-backend-zero-mainnet.emurgornd.com/token/discovery',
      tokenInfos:
        'https://dev-yoroi-backend-zero-mainnet.emurgornd.com/tokens/info/multi',
    },
    preprod: {
      tokenDiscovery:
        'https://dev-yoroi-backend-zero-preprod.emurgornd.com/token/discovery',
      tokenInfos:
        'https://dev-yoroi-backend-zero-preprod.emurgornd.com/tokens/info/multi',
    },
    sancho: {
      tokenDiscovery:
        'https://dev-yoroi-backend-zero-preprod.emurgornd.com/token/discovery',
      tokenInfos:
        'https://dev-yoroi-backend-zero-preprod.emurgornd.com/tokens/info/multi',
    },
  },
  true,
)
