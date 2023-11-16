import {ResolverReceiver} from './receiver'

export interface ResolverApi {
  getCryptoAddress(
    receiverDomain: ResolverReceiver['domain'],
  ): Promise<ResolverAddressesResponse>
}

export type ResolverStrategy = 'all' | 'first'

export type ResolverAddressResponse = {
  address: string | null
  error: string | null
}

export type ResolverAddressesResponse = Array<ResolverAddressResponse>
