import {Swap} from '@yoroi/types'

export const swapStorageMakerNormal = (): Readonly<Swap.Storage> => {
  const slippage: Swap.Storage['slippage'] = {
    read: () => Promise.resolve(0.1),
    remove: () => Promise.resolve(),
    save: () => Promise.resolve(),
    key: 'mock-swap-slippage',
  }

  const config: Swap.Storage['config'] = {
    read: () => Promise.resolve({routingPreference: 'auto'}),
    remove: () => Promise.resolve(),
    save: () => Promise.resolve(),
    key: 'mock-swap-config',
  }

  const clear: Swap.Storage['clear'] = () => Promise.resolve()

  return {
    slippage,
    config,
    clear,
  } as const
}

const unknownError = () => Promise.reject('Unknown error')

export const swapStorageMakerError = (): Readonly<Swap.Storage> => {
  const slippage: Swap.Storage['slippage'] = {
    read: unknownError,
    remove: unknownError,
    save: unknownError,
    key: 'mock-swap-slippage',
  }

  const config: Swap.Storage['config'] = {
    read: unknownError,
    remove: unknownError,
    save: unknownError,
    key: 'mock-swap-config',
  }

  const clear: Swap.Storage['clear'] = unknownError

  return {
    slippage,
    config,
    clear,
  } as const
}
