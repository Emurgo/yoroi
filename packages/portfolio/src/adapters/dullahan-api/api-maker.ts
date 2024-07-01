import {
  FetchData,
  PromiseAllLimited,
  fetchData,
  isLeft,
  isRight,
} from '@yoroi/common'
import {Api, Chain, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {ApiConfig} from '../../types'
import {toDullahanRequest, toSecondaryTokenInfos} from './transformers'
import {
  DullahanApiCachedIdsRequest,
  DullahanApiTokenDiscoveryResponse,
  DullahanApiTokenInfoResponse,
  DullahanApiTokenInfosResponse,
  DullahanApiTokenTraitsResponse,
} from './types'
import {parseTokenDiscovery} from '../../validators/token-discovery'
import {parseTokenTraits} from '../../validators/token-traits'
import {parseTokenInfo} from '../../validators/token-info'

export const portfolioApiMaker = ({
  network,
  maxIdsPerRequest,
  maxConcurrentRequests,
  request = fetchData,
}: {
  network: Chain.SupportedNetworks
  maxIdsPerRequest: number
  maxConcurrentRequests: number
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
        const chunks = []
        for (let i = 0; i < idsWithCache.length; i += maxIdsPerRequest)
          chunks.push(idsWithCache.slice(i, i + maxIdsPerRequest))

        const tasks = chunks.map(
          (ids) => () =>
            request<DullahanApiTokenInfosResponse, DullahanApiCachedIdsRequest>(
              {
                method: 'post',
                url: config.tokenInfos,
                data: toDullahanRequest(ids),
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
              },
            ),
        )

        const responses = await PromiseAllLimited(tasks, maxConcurrentRequests)
        const infos = responses
          .filter(isRight)
          .reduce(
            (acc, {value: {data}}) => Object.assign(acc, data),
            {} as DullahanApiTokenInfosResponse,
          )

        // return with the first error only if none of responses were successful
        const firstError = responses.find(isLeft)
        if (Object.keys(infos).length === 0 && firstError) return firstError

        try {
          const transformedResponseData = toSecondaryTokenInfos(infos)

          const transformedResponse: Api.Response<Portfolio.Api.TokenInfosResponse> =
            freeze(
              {
                tag: 'right',
                value: {
                  status: Api.HttpStatusCode.Ok,
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
                responseData: infos,
              },
            },
            true,
          )
        }
      },

      async tokenInfo(id: Portfolio.Token.Id) {
        const response = await request<DullahanApiTokenInfoResponse>({
          method: 'get',
          url: `${config.tokenInfo}/${id}`,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })

        if (isRight(response)) {
          const tokenInfo: Portfolio.Token.Info | undefined = parseTokenInfo(
            response.value.data,
          )

          if (!tokenInfo) {
            return freeze(
              {
                tag: 'left',
                error: {
                  status: -3,
                  message: 'Failed to transform token info response',
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
                data: tokenInfo,
              },
            },
            true,
          )
        }

        return response
      },

      async tokenTraits(id) {
        const response = await request<DullahanApiTokenTraitsResponse>({
          method: 'get',
          url: `${config.tokenTraits}/${id}`,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })
        if (isRight(response)) {
          const traits: Portfolio.Token.Traits | undefined = parseTokenTraits(
            response.value.data,
          )

          if (!traits) {
            return freeze(
              {
                tag: 'left',
                error: {
                  status: -3,
                  message: 'Failed to transform token traits response',
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
                data: traits,
              },
            },
            true,
          )
        }

        return response
      },
    },
    true,
  )
}

export const apiConfig: ApiConfig = freeze(
  {
    mainnet: {
      tokenDiscovery: 'https://zero.yoroiwallet.com/tokens/discovery',
      tokenInfo: 'https://zero.yoroiwallet.com/tokens/info',
      tokenInfos: 'https://zero.yoroiwallet.com/tokens/info/multi',
      tokenTraits: 'https://zero.yoroiwallet.com/tokens/nft/traits',
    },
    preprod: {
      tokenDiscovery:
        'https://yoroi-backend-zero-preprod.emurgornd.com/tokens/discovery',
      tokenInfo: 'https://yoroi-backend-zero-preprod.emurgornd.com/tokens/info',
      tokenInfos:
        'https://yoroi-backend-zero-preprod.emurgornd.com/tokens/info/multi',
      tokenTraits:
        'https://yoroi-backend-zero-preprod.emurgornd.com/tokens/nft/traits',
    },
    sancho: {
      tokenDiscovery:
        'https://yoroi-backend-zero-sanchonet.emurgornd.com/tokens/discovery',
      tokenInfo:
        'https://yoroi-backend-zero-sanchonet.emurgornd.com/tokens/info',
      tokenInfos:
        'https://yoroi-backend-zero-sanchonet.emurgornd.com/tokens/info/multi',
      tokenTraits:
        'https://yoroi-backend-zero-sanchonet.emurgornd.com/tokens/nft/traits',
    },
  },
  true,
)
