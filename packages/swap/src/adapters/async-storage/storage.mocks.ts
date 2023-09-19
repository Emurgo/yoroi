import {Swap} from '@yoroi/types'

export const makeStorageMaker = (): Readonly<Swap.Storage> => {
  const slippage: Swap.Storage['slippage'] = {
    read: () => Promise.resolve(0.1),
    remove: () => Promise.resolve(),
    save: () => Promise.resolve(),
    key: 'mock-swap-slippage',
  }

  const clear: Swap.Storage['clear'] = () => Promise.resolve()

  return {
    slippage,
    clear,
  } as const
}

const unknownError = () => Promise.reject('Unknown error')
export const makeStorageMakerDefault = (): Readonly<Swap.Storage> => {
  const slippage: Swap.Storage['slippage'] = {
    read: unknownError,
    remove: unknownError,
    save: unknownError,
    key: 'mock-swap-slippage',
  }

  const clear: Swap.Storage['clear'] = unknownError

  return {
    slippage,
    clear,
  } as const
}
