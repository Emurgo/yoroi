import {ResolverApi} from './api'
import {ResolverStorage} from './storage'

export type ResolverModule = Readonly<{
  crypto: {
    getCardanoAddresses: ResolverApi['getCardanoAddresses']
  }
  showNotice: ResolverStorage['showNotice']
}>
