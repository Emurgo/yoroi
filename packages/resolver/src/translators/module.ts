import {resolverApiMaker} from '../adapters/api'
import {Resolver} from '@yoroi/types'

export const resolverModuleMaker = (
  resolutionStrategy: Resolver.Strategy,
  resolverStorage: Resolver.Storage,
  apiConfig?: any,
): Resolver.Module => {
  const {notice} = resolverStorage
  const api = resolverApiMaker(resolutionStrategy, apiConfig)

  return {
    address: {getCryptoAddress: api.getCryptoAddress},
    notice,
  }
}
