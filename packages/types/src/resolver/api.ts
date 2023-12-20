import {AxiosRequestConfig} from 'axios'

import {ResolverReceiver} from './receiver'

export interface ResolverApi {
  getCardanoAddresses(
    args: {
      resolve: ResolverReceiver['resolve']
      strategy?: ResolverStrategy
    },
    fetcherOptions?: AxiosRequestConfig,
  ): Promise<ResolverAddressesResponse>
}

export type ResolverStrategy = 'all' | 'first'

export type ResolverAddressResponse = Readonly<{
  address: string | null
  error: string | null
  nameServer: string | null
}>

export type ResolverAddressesResponse = ReadonlyArray<ResolverAddressResponse>
