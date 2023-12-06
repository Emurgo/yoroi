import {mockStorageMaker} from './adapters/storage.mocks'
import {mockResolverApi} from './adapters/api.mocks'
import {resolverModuleMocks} from './translators/module.mocks'

export * from './translators/module'
export * from './adapters/storage'
export * from './adapters/api'
export * from './translators/reactjs/hooks/useResolverCryptoAddresses'
export * from './translators/reactjs/hooks/useResolverSetShowNotice'
export * from './translators/reactjs/hooks/useResolverShowNotice'
export * from './translators/reactjs/provider/ResolverProvider'
export * from './utils/isDomain'

export const mocksResolver = {
  storage: mockStorageMaker,
  api: mockResolverApi,
  module: resolverModuleMocks.success,
} as const
