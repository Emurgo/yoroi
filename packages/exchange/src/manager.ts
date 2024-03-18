import {Exchange} from '@yoroi/types'
import {AxiosRequestConfig} from 'axios'
import {freeze} from 'immer'
import {urlReferralQueryStringParamsSchema} from './adapters/zod-schema'
import {getValidationError} from './helpers/get-validation-error'
import {extractAccessTokenFromBaseUrl} from './helpers/extract-access-token'

export const exchangeManagerMaker = ({
  api,
}: {
  api: Exchange.Api
}): Exchange.Manager => {
  return freeze(
    {
      provider: {
        suggested: {
          byOrderType: () => {
            const suggestedProvidersByOrderType: Readonly<
              Record<Exchange.OrderType, Exchange.Provider['id']>
            > = freeze({
              sell: 'encryptus',
              buy: 'banxa',
            })
            return suggestedProvidersByOrderType
          },
        },
        list: {
          byOrderType: async (orderType: Exchange.OrderType) => {
            return api.getProviders().then((providers) => {
              return freeze(
                Object.entries(providers).filter(
                  ([, provider]) => orderType in provider.supportedOrders,
                ),
                true,
              )
            })
          },
        },
      },
      referralLink: {
        create: async (
          {
            providerId,
            queries,
          }: {
            providerId: string
            queries: Exchange.ReferralUrlQueryStringParams
          },
          fetcherOptions?: AxiosRequestConfig,
        ) => {
          try {
            const baseUrl = await api.getBaseUrl(providerId, fetcherOptions)
            const {access_token} = extractAccessTokenFromBaseUrl(baseUrl)
            const {origin, pathname} = new URL(baseUrl)
            const reconstructedBaseUrl = origin + pathname // to remove any params (access token) from baseUrl

            const allQueries =
              access_token !== null ? {...queries, access_token} : queries

            const validatedQueries =
              urlReferralQueryStringParamsSchema.parse(allQueries)

            const url = new URL(reconstructedBaseUrl)
            const params = new URLSearchParams()
            for (const [key, value] of Object.entries(validatedQueries)) {
              params.append(key, value.toString())
            }

            url.search = params.toString()
            return Promise.resolve(url)
          } catch (error) {
            return Promise.reject(getValidationError(error))
          }
        },
      },
    },
    true,
  )
}
