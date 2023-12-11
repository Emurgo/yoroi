import {Resolver} from '@yoroi/types'

export const serviceName = {
  [Resolver.Service.Cns]: 'CNS',
  [Resolver.Service.Unstoppable]: 'Unstoppable Domains',
  [Resolver.Service.Handle]: 'ADA Handle',
} as const
