import {FetchData, fetchData, getApiError, isLeft} from '@yoroi/common'
import {freeze} from 'immer'
import {z} from 'zod'
import {AxiosRequestConfig} from 'axios'

import {getValidationError} from '../../helpers/get-validation-error'

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

      const test = EncryptusApiResponseSchema.safeParse(response.value.data)

      console.log('test', test)

      const parsedResponse = EncryptusApiResponseSchema.parse(
        response.value.data,
      )
      return parsedResponse.data.link
    } catch (error: unknown) {
      throw getValidationError(error)
    }
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
