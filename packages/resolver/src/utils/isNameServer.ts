import {Resolver} from '@yoroi/types'

export const isNameServer = (key: string): key is Resolver.NameServer =>
  Object.values(Resolver.NameServer).includes(key as Resolver.NameServer)
