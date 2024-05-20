import {FetchData, fetchData, getApiError, isLeft, createTypeGuardFromSchema} from '@yoroi/common'
import {freeze} from 'immer'
import {AxiosRequestConfig} from 'axios'
import {z} from 'zod'

const dappListHost = 'https://daehx1qv45z7c.cloudfront.net'
const initialDeps = freeze({request: fetchData}, true)

export type Api = {
  getDApps: (fetcherConfig?: AxiosRequestConfig) => Promise<DappListResponse>
}

export const dappConnectorApiMaker = ({request}: {request: FetchData} = initialDeps): Api => {
  const getDApps = async (fetcherConfig?: AxiosRequestConfig): Promise<DappListResponse> => {
    const config = {url: `${dappListHost}/data.json`} as const

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
        logo: `${dappListHost}/${dapp.logo}`,
        uri: dapp.uri,
        origins: dapp.origins,
      })),
      filters: value.filters,
    }
  }
  return {getDApps}
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
