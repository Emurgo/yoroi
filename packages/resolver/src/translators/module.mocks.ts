import {Resolver} from '@yoroi/types'

import {mockResolverApi} from '../adapters/api.mocks'
import {mockStorageMaker} from '../adapters/storage.mocks'

const resolverModuleSuccess: Resolver.Module = {
  address: mockResolverApi.success,
  notice: mockStorageMaker.success.notice,
} as const

const resolverModuleError: Resolver.Module = {
  address: mockResolverApi.error,
  notice: mockStorageMaker.error.notice,
} as const

export const mockResolverModule = {
  success: resolverModuleSuccess,
  error: resolverModuleError,
} as const
