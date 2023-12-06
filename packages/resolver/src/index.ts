import {mockStorageMaker} from './adapters/storage.mocks'
import {mockResolverApi} from './adapters/api.mocks'
import {mockResolverModule} from './translators/module.mocks'

export * from './translators/module'
export * from './adapters/storage'
export * from './adapters/api'
export * from './translators/reactjs/hooks/useReadResolverNoticeStatus'
export * from './translators/reactjs/hooks/useResolverAddresses'
export * from './translators/reactjs/hooks/useSaveResolverNoticeStatus'
export * from './translators/reactjs/provider/ResolverProvider'
export * from './utils/isDomain'

export const mocksResolver = {
  storage: mockStorageMaker,
  api: mockResolverApi,
  module: mockResolverModule,
} as const
