import {mockResolverApi} from './adapters/api.mocks'
import {mockStorageMaker} from './adapters/storage.mocks'
import {resolverManagerMocks} from './translators/manager.mocks'

export * from './adapters/api'
export * from './adapters/handle/api'
export * from './adapters/storage'
export * from './translators/constants'
export * from './translators/domainNormalizer'
export * from './translators/manager'
export * from './translators/reactjs/hooks/useResolverCryptoAddresses'
export * from './translators/reactjs/hooks/useResolverDRepId'
export * from './translators/reactjs/hooks/useResolverSetShowNotice'
export * from './translators/reactjs/hooks/useResolverShowNotice'
export * from './translators/reactjs/provider/ResolverProvider'
export * from './utils/isDomain'
export * from './utils/isNameServer'
export * from './utils/isResolvableDomain'

export const mocksResolver = {
  storage: mockStorageMaker,
  api: mockResolverApi,
  manager: resolverManagerMocks.success,
} as const
