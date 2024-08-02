import {FetchData, fetchData, getApiError, isLeft, createTypeGuardFromSchema} from '@yoroi/common'
import {freeze} from 'immer'
import {AxiosRequestConfig} from 'axios'
import {z} from 'zod'

const dappListHosts = {
  mainnet: 'https://daehx1qv45z7c.cloudfront.net/data.json',
  preprod: 'https://daehx1qv45z7c.cloudfront.net/preprod.json',
  sancho: 'https://daehx1qv45z7c.cloudfront.net/sancho.json',
} as const

const initialDeps = freeze({request: fetchData}, true)

type GetDAppsOptions = {
  networkId: number
}

export type Api = {
  getDApps: (options: GetDAppsOptions, fetcherConfig?: AxiosRequestConfig) => Promise<DappListResponse>
}

export const dappConnectorApiMaker = ({request}: {request: FetchData} = initialDeps): Api => {
  const getDApps = async (options: GetDAppsOptions, fetcherConfig?: AxiosRequestConfig): Promise<DappListResponse> => {
    const url = dappListHosts[getNetworkNameByNetworkId(options.networkId)]

    const response = await request<unknown>({url}, fetcherConfig)

    if (isLeft(response)) throw getApiError(response.error)

    if (!isDappListResponse(response.value.data)) {
      throw new Error('Invalid dapp list response: ' + JSON.stringify(response.value.data))
    }

    const {hostname} = new URL(url)

    const value = response.value.data
    return {
      dapps: value.dapps.map((dapp) => ({
        id: dapp.id,
        name: dapp.name,
        description: dapp.description,
        category: dapp.category,
        logo: `${hostname}/${dapp.logo}`,
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

const getNetworkNameByNetworkId = (networkId: number): 'mainnet' | 'preprod' | 'sancho' => {
  switch (networkId) {
    case 1:
      return 'mainnet'
    case 2:
      return 'preprod'
    case 3:
      return 'sancho'
    default:
      throw new Error('Invalid network id')
  }
}
