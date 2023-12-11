import {Resolver} from '@yoroi/types'

import {resolverApiMocks} from '../adapters/api.mocks'
import {mockStorageMaker} from '../adapters/storage.mocks'

const resolverManagerSuccess: Resolver.Manager = {
  crypto: {getCardanoAddresses: resolverApiMocks.getCardanoAddresses.success},
  showNotice: mockStorageMaker.success.showNotice,
} as const

const resolverManagerError: Resolver.Manager = {
  crypto: {getCardanoAddresses: resolverApiMocks.getCardanoAddresses.error},
  showNotice: mockStorageMaker.error.showNotice,
} as const

export const resolverManagerMocks = {
  success: resolverManagerSuccess,
  error: resolverManagerError,

  getCardanoAddresses: resolverApiMocks.getCardanoAddresses,
  getCryptoAddressesResponse: resolverApiMocks.getCryptoAddressesResponse,
} as const
