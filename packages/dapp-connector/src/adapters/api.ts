import {FetchData, fetchData, getApiError, isLeft, createTypeGuardFromSchema} from '@yoroi/common'
import {freeze} from 'immer'
import {AxiosRequestConfig} from 'axios'
import {z} from 'zod'
import {Chain} from '@yoroi/types'

const dappListHosts: Readonly<Record<Chain.SupportedNetworks, string>> = freeze({
  [Chain.Network.Mainnet]: 'https://daehx1qv45z7c.cloudfront.net/data.json',
  [Chain.Network.Preprod]: 'https://daehx1qv45z7c.cloudfront.net/preprod.json',
  [Chain.Network.Sancho]: 'https://daehx1qv45z7c.cloudfront.net/sancho.json',
  [Chain.Network.Preview]: 'https://daehx1qv45z7c.cloudfront.net/preview.json',
})

const initialDeps = freeze({request: fetchData}, true)

type GetDAppsOptions = {
  network: Chain.SupportedNetworks
}

export type Api = {
  getDApps: (options: GetDAppsOptions, fetcherConfig?: AxiosRequestConfig) => Promise<DappListResponse>
}

export const dappConnectorApiMaker = ({request}: {request: FetchData} = initialDeps): Api => {
  const getDApps = async (options: GetDAppsOptions, fetcherConfig?: AxiosRequestConfig): Promise<DappListResponse> => {
    const url = dappListHosts[options.network]

    const response = await request<unknown>({url}, fetcherConfig)

    if (isLeft(response)) throw getApiError(response.error)

    if (!isDappListResponse(response.value.data)) {
      throw new Error('Invalid dapp list response: ' + JSON.stringify(response.value.data))
    }

    const {hostname, protocol} = new URL(url)

    const value = response.value.data
    return {
      dapps: value.dapps.map((dapp) => ({
        id: dapp.id,
        name: dapp.name,
        description: dapp.description,
        category: dapp.category,
        logo: `${protocol}//${hostname}/${dapp.logo}`,
        uri: dapp.uri,
        origins: dapp.origins,
        isSingleAddress: dapp.isSingleAddress ?? false,
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
  isSingleAddress: z.boolean().optional(),
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
  isSingleAddress: boolean
}
