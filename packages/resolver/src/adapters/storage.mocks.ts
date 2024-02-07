import {Resolver} from '@yoroi/types'

const makeStorageMakerSuccess = (): Readonly<Resolver.Storage> => {
  const showNotice: Resolver.Storage['showNotice'] = {
    read: () => Promise.resolve(true),
    remove: () => Promise.resolve(),
    save: () => Promise.resolve(),
    key: 'mock-resolver-show-notice',
  }

  const clear: Resolver.Storage['clear'] = () => Promise.resolve()

  return {
    showNotice,
    clear,
  } as const
}

const unknownError = () => Promise.reject(new Error('Unknown error'))

const makeStorageMakerError = (): Readonly<Resolver.Storage> => {
  const showNotice: Resolver.Storage['showNotice'] = {
    read: unknownError,
    remove: unknownError,
    save: unknownError,
    key: 'mock-resolver-show-notice',
  }

  const clear: Resolver.Storage['clear'] = unknownError

  return {
    showNotice,
    clear,
  } as const
}

export const mockStorageMaker = {
  success: makeStorageMakerSuccess(),
  error: makeStorageMakerError(),
} as const
