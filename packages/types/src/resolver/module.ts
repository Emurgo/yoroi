import {ResolverApi} from './api'

export type ResolverModule = Readonly<{
  address: {
    getCryptoAddress: ResolverApi['getCryptoAddress']
  }
}>
