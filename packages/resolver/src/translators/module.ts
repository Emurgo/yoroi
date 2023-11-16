import {resolverApiMaker} from '../adapters/api'
import {Resolver} from '@yoroi/types'

export const resolverModuleMaker = (
  resolutionStrategy: Resolver.Strategy,
  apiConfig: any = {},
): Resolver.Module => {
  const api = resolverApiMaker(resolutionStrategy, apiConfig)

  return {
    address: {getCryptoAddress: api.getCryptoAddress},
  }
}
