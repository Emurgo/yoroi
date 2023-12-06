import {Resolver} from '@yoroi/types'

export const resolverModuleMaker = (
  resolverStorage: Resolver.Storage,
  resolverApi: Resolver.Api,
): Resolver.Module => {
  const {notice} = resolverStorage
  const {getCryptoAddresses} = resolverApi

  return {
    address: {getCryptoAddresses},
    notice,
  } as const
}
