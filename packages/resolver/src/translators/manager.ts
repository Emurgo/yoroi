import {Resolver} from '@yoroi/types'

export const resolverManagerMaker = (
  resolverStorage: Resolver.Storage,
  resolverApi: Resolver.Api,
): Resolver.Manager => {
  const {showNotice} = resolverStorage
  const {getCardanoAddresses} = resolverApi

  return {
    crypto: {getCardanoAddresses},
    showNotice,
  } as const
}
