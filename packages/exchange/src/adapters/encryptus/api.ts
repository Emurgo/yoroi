import {FetchData, fetchData, handleApiError, isLeft} from '@yoroi/common'
import {z} from 'zod'
import {handleZodErrors} from '../zod-errors'
import {AxiosRequestConfig} from 'axios'
import {Exchange} from '@yoroi/types'

const initialDeps = {request: fetchData} as const

export const encryptusApiGetBaseUrl = ({
  request,
}: {request: FetchData} = initialDeps) => {
  return async ({
    isProduction,
    fetcherConfig,
  }: {
    isProduction: boolean
    fetcherConfig?: AxiosRequestConfig
  }): Promise<string> => {
    const url = isProduction
      ? encryptusApiConfig.production.getBaseUrl
      : encryptusApiConfig.sandbox.getBaseUrl

    const config = {
      url,
    } as const

    try {
      const response = await request<EncryptusApiResponse>(
        config,
        fetcherConfig,
      )

      if (isLeft(response)) {
        handleApiError(response.error)
      } else {
        const parsedResponse = EncryptusApiResponseSchema.parse(
          response.value.data,
        )
        return parsedResponse.data.link
      }
    } catch (error: unknown) {
      return handleEncryptusApiError(error)
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

export const encryptusApiConfig = {
  production: {
    getBaseUrl: 'https://api.yoroiwallet.com/api/v2/encryptus/payoutlink',
  },
  sandbox: {
    getBaseUrl:
      'https://preprod-backend.yoroiwallet.com/api/v2/encryptus/payoutlink',
  },
} as const

export const handleEncryptusApiError = (error: unknown): never => {
  handleZodErrors(error)
  /* istanbul ignore next */
  throw new Exchange.Errors.Unknown(JSON.stringify(error)) // TS doesn't know that zodErrorTranslator will throw
}
