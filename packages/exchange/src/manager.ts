import {Exchange} from '@yoroi/types'
import {AxiosRequestConfig} from 'axios'
import {freeze} from 'immer'
import {urlReferralQueryStringParamsSchema} from './adapters/zod-schema'
import {getValidationError} from './helpers/get-validation-error'

export const exchangeManagerMaker = ({api}: {api: Exchange.Api}) => {
  return freeze(
    {
      provider: {
        suggested: {
          // TODO: don't cast, make it syncronous now
          byOrderType: () =>
            ({
              ['sell']: 'banxa',
              ['buy']: 'banxa',
            } as {[key in Exchange.OrderType]: string}),
        },
        list: {
          byOrderType: async (orderType: Exchange.OrderType) => {
            return api.getProviders().then((providers) => {
              return freeze(
                Object.entries(providers).filter(
                  ([, provider]) => orderType in provider,
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
          api.getBaseUrl(providerId, fetcherOptions).then((baseUrl) => {
            try {
              const validatedQueries =
                urlReferralQueryStringParamsSchema.parse(queries)
              const url = new URL(baseUrl)
              const params = new URLSearchParams()
              for (const [key, value] of Object.entries(validatedQueries)) {
                params.append(key, value.toString())
              }
              url.search = params.toString()
              return Promise.resolve(url)
            } catch (error) {
              const validationError = getValidationError(error)
              return Promise.reject(validationError)
            }
          })
        },
      },
    },
    true,
  )
}

// TODO: placeholder for @yoroi/types
export type ExchangeManager = ReturnType<typeof exchangeManagerMaker>
