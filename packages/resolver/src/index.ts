import {mockStorageMaker} from './adapters/storage.mocks'
import {mockResolverApi} from './adapters/api.mocks'
import {mockResolverModule} from './translators/module.mocks'

export {resolverModuleMaker} from './translators/module'
export {resolverStorageMaker} from './adapters/storage'
export {resolverApiMaker} from './adapters/api'

export const mocksResolver = {
  storage: mockStorageMaker,
  api: mockResolverApi,
  module: mockResolverModule,
} as const
