import {ResolverReceiver} from './receiver'

export interface ResolverApi {
  getCryptoAddresses(
    receiverDomain: ResolverReceiver['domain'],
    resolverStrategy?: ResolverStrategy,
  ): Promise<ResolverAddressesResponse>
}

export type ResolverStrategy = 'all' | 'first'

export type ResolverAddressResponse = {
  address: string | null
  error: string | null
  service: string | null
}

export type ResolverAddressesResponse = Array<ResolverAddressResponse>
