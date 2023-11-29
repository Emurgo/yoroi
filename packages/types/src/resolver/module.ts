import {ResolverApi} from './api'
import {ResolverStorage} from './storage'

export type ResolverModule = Readonly<{
  address: {
    getCryptoAddress: ResolverApi['getCryptoAddress']
  }
  notice: ResolverStorage['notice']
}>
