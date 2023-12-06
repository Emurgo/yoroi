import {Resolver} from '@yoroi/types'

export const resolverModuleMaker = (
  resolverStorage: Resolver.Storage,
  resolverApi: Resolver.Api,
): Resolver.Module => {
  const {showNotice} = resolverStorage
  const {getCardanoAddresses} = resolverApi

  return {
    crypto: {getCardanoAddresses},
    showNotice,
  } as const
}
