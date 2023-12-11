import {ResolverApi} from './api'
import {ResolverStorage} from './storage'

export type ResolverManager = Readonly<{
  crypto: {
    getCardanoAddresses: ResolverApi['getCardanoAddresses']
  }
  showNotice: ResolverStorage['showNotice']
}>
