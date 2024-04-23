import {FetchData, fetchData, getApiError, isLeft, createTypeGuardFromSchema} from '@yoroi/common'
import {freeze} from 'immer'
import {AxiosRequestConfig} from 'axios'
import {z} from 'zod'

const DAPP_LIST_HOST = 'https://daehx1qv45z7c.cloudfront.net'
const initialDeps = freeze({request: fetchData}, true)

export const dappConnectorApiGetDappList = ({request}: {request: FetchData} = initialDeps) => {
  return async (fetcherConfig?: AxiosRequestConfig): Promise<DappListResponse> => {
    const config = {url: `${DAPP_LIST_HOST}/data.json`} as const

    try {
      const response = await request<unknown>(config, fetcherConfig)

      if (isLeft(response)) throw getApiError(response.error)

      if (!isDappListResponse(response.value.data)) {
        throw new Error('Invalid dapp list response: ' + JSON.stringify(response.value.data))
      }

      const value = response.value.data
      return {
        dapps: value.dapps.map((dapp) => ({
          id: dapp.id,
          name: dapp.name,
          description: dapp.description,
          category: dapp.category,
          logo: `${DAPP_LIST_HOST}/${dapp.logo}`,
          uri: dapp.uri,
          origins: dapp.origins,
        })),
        filters: value.filters,
      }
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

const isDappListResponse = createTypeGuardFromSchema(DappListResponseSchema)

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
