import {Resolver} from '@yoroi/types'

import {resolverApiMocks} from '../adapters/api.mocks'
import {mockStorageMaker} from '../adapters/storage.mocks'

const resolverModuleSuccess: Resolver.Module = {
  crypto: {getCardanoAddresses: resolverApiMocks.getCardanoAddresses.success},
  showNotice: mockStorageMaker.success.showNotice,
} as const

const resolverModuleError: Resolver.Module = {
  crypto: {getCardanoAddresses: resolverApiMocks.getCardanoAddresses.error},
  showNotice: mockStorageMaker.error.showNotice,
} as const

export const resolverModuleMocks = {
  success: resolverModuleSuccess,
  error: resolverModuleError,

  getCardanoAddresses: resolverApiMocks.getCardanoAddresses,
  getCryptoAddressesResponse: resolverApiMocks.getCryptoAddressesResponse,
} as const
