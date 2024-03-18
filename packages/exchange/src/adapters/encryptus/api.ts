import {FetchData, fetchData, getApiError, isLeft} from '@yoroi/common'
import {freeze} from 'immer'
import {z} from 'zod'
import {AxiosRequestConfig} from 'axios'

import {getValidationError} from '../../helpers/get-validation-error'
import {Exchange} from '@yoroi/types'

const initialDeps = freeze({request: fetchData}, true)

export const encryptusApiGetBaseUrl = (
  {isProduction}: {isProduction: boolean},
  {request}: {request: FetchData} = initialDeps,
) => {
  return async (fetcherConfig?: AxiosRequestConfig) => {
    const config = {
      url: encryptusApiConfig[isProduction ? 'production' : 'sandbox']
        .getBaseUrl,
    } as const

    try {
      const response = await request<EncryptusApiResponse>(
        config,
        fetcherConfig,
      )

      if (isLeft(response)) throw getApiError(response.error)

      const parsedResponse = EncryptusApiResponseSchema.parse(
        response.value.data,
      )
      return parsedResponse.data.link
    } catch (error: unknown) {
      throw getValidationError(error)
    }
  }
}

export const encryptusExtractParamsFromBaseUrl = (
  baseUrl: string,
): Pick<Exchange.ReferralUrlQueryStringParams, 'access_token'> => {
  const url = new URL(baseUrl)
  const params = new URLSearchParams(url.search)

  try {
    const parsedParams = EncryptusBaseUrlParams.parse({
      access_token: params.get('access_token'),
    })

    return {access_token: parsedParams.access_token}
  } catch (error: unknown) {
    throw getValidationError(error)
  }
}

export type EncryptusApiResponse = {
  status: number
  data: {
    link: string
  }
}

const EncryptusApiResponseSchema = z.object({
  data: z.object({
    link: z.string(),
  }),
})

const EncryptusBaseUrlParams = z.object({
  access_token: z.string(),
})

export const encryptusApiConfig = freeze(
  {
    production: {
      getBaseUrl: 'https://api.yoroiwallet.com/api/v2/encryptus/payoutlink',
    },
    sandbox: {
      getBaseUrl:
        'https://preprod-backend.yoroiwallet.com/api/v2/encryptus/payoutlink',
    },
  },
  true,
)
