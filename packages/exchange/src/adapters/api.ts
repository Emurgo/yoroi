import {Exchange} from '@yoroi/types'
import {AxiosRequestConfig} from 'axios'
import {freeze} from 'immer'

import {encryptusApiGetBaseUrl} from './encryptus/api'
import {banxaApiGetBaseUrl} from './banxa/api'

const initialDeps = freeze(
  {
    banxaApi: {
      getBaseUrl: banxaApiGetBaseUrl,
    },
    encryptusApi: {
      getBaseUrl: encryptusApiGetBaseUrl,
    },
  },
  true,
)

export const exchangeApiMaker = (
  {isProduction, partner}: {isProduction: boolean; partner: string},
  {
    banxaApi,
    encryptusApi,
  }: {
    banxaApi: {getBaseUrl: typeof banxaApiGetBaseUrl}
    encryptusApi: {
      getBaseUrl: typeof encryptusApiGetBaseUrl
    }
  } = initialDeps,
): Exchange.Api => {
  const getProviders = async () => Promise.resolve(providers)

  const getBaseUrl = (
    providerId: string,
    fetcherConfig?: AxiosRequestConfig,
  ) => {
    switch (providerId) {
      case 'banxa':
        return banxaApi.getBaseUrl({isProduction, partner})()
      case 'encryptus':
        return encryptusApi.getBaseUrl({isProduction})(fetcherConfig)
      default:
        return Promise.reject(
          new Exchange.Errors.ProviderNotFound(
            `Unknown provider: ${providerId}`,
          ),
        )
    }
  }

  return freeze({getBaseUrl, getProviders}, true)
}

export const providers: Readonly<Record<string, Exchange.Provider>> = freeze(
  {
    banxa: {
      id: 'banxa',
      name: 'Banxa',
      logo: 'banxa',
      supportedOrders: {
        buy: {
          fee: 2,
          min: 100000000,
        },
      },
      supportUrl: 'https://support.banxa.com/',
    },
    encryptus: {
      id: 'encryptus',
      name: 'Encryptus',
      logo: 'encryptus',
      supportedOrders: {
        sell: {
          fee: 2.5,
          min: 1000000,
        },
      },
      supportUrl: 'https://support.encryptus.com/',
    },
  },
  true,
)
