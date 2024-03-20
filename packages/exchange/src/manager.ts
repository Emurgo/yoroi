import {Exchange} from '@yoroi/types'
import {AxiosRequestConfig} from 'axios'
import {freeze} from 'immer'
import {urlReferralQueryStringParamsSchema} from './adapters/zod-schema'
import {getValidationError} from './helpers/get-validation-error'

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

            const url = new URL(baseUrl)
            const {origin, pathname} = url
            const baseUrlParams = new URLSearchParams(url.search)
            const accessToken = baseUrlParams.get('access_token')

            const reconstructedBaseUrl =
              origin + (pathname === '/' ? '' : pathname) // to remove any params (access token) from baseUrl
            const recontructedUrl = new URL(reconstructedBaseUrl)

            const allQueries =
              accessToken !== null
                ? {...queries, access_token: accessToken}
                : queries

            const parsedQueries =
              urlReferralQueryStringParamsSchema.parse(allQueries)

            const params = new URLSearchParams()
            for (const [key, value] of Object.entries(parsedQueries)) {
              params.append(key, value.toString())
            }

            recontructedUrl.search = params.toString()

            return Promise.resolve(recontructedUrl)
          } catch (error) {
            return Promise.reject(getValidationError(error))
          }
        },
      },
    },
    true,
  )
}
