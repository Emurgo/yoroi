import {Resolver} from '@yoroi/types'

import {freeze} from 'immer'

export const resolverManagerMaker = (
  resolverStorage: Resolver.Storage,
  resolverApi: Resolver.Api,
): Resolver.Manager => {
  const {showNotice} = resolverStorage
  const {getCardanoAddresses} = resolverApi

  return freeze(
    {
      crypto: {getCardanoAddresses},
      showNotice,
    } as const,
    true,
  )
}
