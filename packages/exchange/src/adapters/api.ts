import {Exchange} from '@yoroi/types'
import {encryptusApiGetBaseUrl} from './encryptus/api'
import {banxaApiGetBaseUrl} from './banxa/api'

const initialDeps = {
  banxaApi: {
    getBaseUrl: banxaApiGetBaseUrl,
  },
  encryptusApi: {
    getBaseUrl: encryptusApiGetBaseUrl,
  },
} as const

export const exchangeApiMaker = (
  {
    provider,
  }: {
    provider: Exchange.Provider
  },
  {
    banxaApi,
    encryptusApi,
  }: {
    banxaApi: {getBaseUrl: typeof banxaApiGetBaseUrl}
    encryptusApi: {getBaseUrl: typeof encryptusApiGetBaseUrl}
  } = initialDeps,
): Exchange.Api => {
  const getBanxaBaseUrl = banxaApi.getBaseUrl()
  const getEncryptusBaseUrl = encryptusApi.getBaseUrl()

  const operationsGetBaseUrl = {
    [Exchange.Provider.Banxa]: getBanxaBaseUrl,
    [Exchange.Provider.Encryptus]: getEncryptusBaseUrl,
  }

  const getBaseUrl = operationsGetBaseUrl[provider]

  return {getBaseUrl} as const
}
