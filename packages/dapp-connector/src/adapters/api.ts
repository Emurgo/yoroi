import {FetchData, fetchData, getApiError, isLeft} from '@yoroi/common'
import {freeze} from 'immer'
import {AxiosRequestConfig} from 'axios'
import {z} from 'zod'

const DAPP_LIST_API = 'https://daehx1qv45z7c.cloudfront.net/data.json'
const initialDeps = freeze({request: fetchData}, true)

export const dappConnectorApiGetDappList = ({request}: {request: FetchData} = initialDeps) => {
  return async (fetcherConfig?: AxiosRequestConfig) => {
    const config = {
      url: DAPP_LIST_API,
    } as const

    try {
      const response = await request<DappListResponse>(config, fetcherConfig)

      if (isLeft(response)) throw getApiError(response.error)

      if (!DappListResponseSchema.safeParse(response.value)) {
        throw new Error('Invalid dapp list response')
      }

      return response
    } catch (error: unknown) {
      throw error
    }
  }
}

const DappResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  logo: z.string(),
  uri: z.string(),
  origins: z.array(z.string()),
})

const DappListResponseSchema = z.object({
  dapps: z.array(DappResponseSchema),
  filters: z.record(z.array(z.string())),
})

export interface DappListResponse {
  dapps: DappResponse[]
  filters: Record<string, string[]>
}

interface DappResponse {
  id: string
  name: string
  description: string
  category: string
  logo: string
  uri: string
  origins: string[]
}
