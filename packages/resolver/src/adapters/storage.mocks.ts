import {Resolver} from '@yoroi/types'

export const makeStorageMaker = (): Readonly<Resolver.Storage> => {
  const noticed: Resolver.Storage['noticed'] = {
    read: () => Promise.resolve(true),
    remove: () => Promise.resolve(),
    save: () => Promise.resolve(),
    key: 'mock-resolver-noticed',
  }

  const clear: Resolver.Storage['clear'] = () => Promise.resolve()

  return {
    noticed,
    clear,
  } as const
}

const unknownError = () => Promise.reject('Unknown error')
export const makeStorageMakerDefault = (): Readonly<Resolver.Storage> => {
  const noticed: Resolver.Storage['noticed'] = {
    read: unknownError,
    remove: unknownError,
    save: unknownError,
    key: 'mock-resolver-noticed',
  }

  const clear: Resolver.Storage['clear'] = unknownError

  return {
    noticed,
    clear,
  } as const
}
