import {Resolver} from '@yoroi/types'

const makeStorageMakerSuccess = (): Readonly<Resolver.Storage> => {
  const notice: Resolver.Storage['notice'] = {
    read: () => Promise.resolve(true),
    remove: () => Promise.resolve(),
    save: () => Promise.resolve(),
    key: 'mock-resolver-notice',
  }

  const clear: Resolver.Storage['clear'] = () => Promise.resolve()

  return {
    notice,
    clear,
  } as const
}

const makeStorageMakerError = (): Readonly<Resolver.Storage> => {
  const notice: Resolver.Storage['notice'] = {
    read: unknownError,
    remove: unknownError,
    save: unknownError,
    key: 'mock-resolver-notice',
  }

  const clear: Resolver.Storage['clear'] = unknownError

  return {
    notice,
    clear,
  } as const
}

export const mockStorageMaker = {
  success: makeStorageMakerSuccess(),
  error: makeStorageMakerError(),
} as const

const unknownError = () => Promise.reject(new Error('Unknown error'))
