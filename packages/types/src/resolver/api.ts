import {ResolverReceiver} from './receiver'

export interface ResolverApi {
  getCardanoAddresses(
    receiver: ResolverReceiver['receiver'],
    strategy?: ResolverStrategy,
  ): Promise<ResolverAddressesResponse>
}

export type ResolverStrategy = 'all' | 'first'

export type ResolverAddressResponse = Readonly<{
  address: string | null
  error: string | null
  nameServer: string | null
}>

export type ResolverAddressesResponse = ReadonlyArray<ResolverAddressResponse>
