import {mockStorageMaker} from './adapters/storage.mocks'
import {mockResolverApi} from './adapters/api.mocks'
import {resolverManagerMocks} from './translators/manager.mocks'

export * from './translators/manager'
export * from './translators/constants'
export * from './translators/domainNormalizer'
export * from './adapters/storage'
export * from './adapters/api'
export * from './translators/reactjs/hooks/useResolverCryptoAddresses'
export * from './translators/reactjs/hooks/useResolverSetShowNotice'
export * from './translators/reactjs/hooks/useResolverShowNotice'
export * from './translators/reactjs/provider/ResolverProvider'
export * from './utils/isResolvableDomain'
export * from './utils/isDomain'
export * from './utils/isNameServer'

export const mocksResolver = {
  storage: mockStorageMaker,
  api: mockResolverApi,
  manager: resolverManagerMocks.success,
} as const
