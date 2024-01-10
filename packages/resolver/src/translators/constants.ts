import {Resolver} from '@yoroi/types'

export const nameServerName = {
  [Resolver.NameServer.Cns]: 'Cardano Name Service (CNS)',
  [Resolver.NameServer.Unstoppable]: 'Unstoppable Domains',
  [Resolver.NameServer.Handle]: 'ADA Handle',
} as const
