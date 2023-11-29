import {Resolver} from '@yoroi/types'

export const makeStorageMaker = (): Readonly<Resolver.Storage> => {
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

const unknownError = () => Promise.reject('Unknown error')
export const makeStorageMakerDefault = (): Readonly<Resolver.Storage> => {
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
