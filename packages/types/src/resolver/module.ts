import {ResolverApi} from './api'
import {ResolverStorage} from './storage'

export type ResolverModule = Readonly<{
  address: {
    getCryptoAddresses: ResolverApi['getCryptoAddresses']
  }
  notice: ResolverStorage['notice']
}>
