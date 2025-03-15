import {Swap} from '@yoroi/types'

export const swapStorageMakerNormal = (): Readonly<Swap.Storage> => {
  const config: Swap.Storage['config'] = {
    read: () => Promise.resolve({routingPreference: 'auto', slippage: 1}),
    remove: () => Promise.resolve(),
    save: () => Promise.resolve(),
    key: 'mock-swap-config',
  }

  const clear: Swap.Storage['clear'] = () => Promise.resolve()

  return {
    config,
    clear,
  } as const
}

const unknownError = () => Promise.reject('Unknown error')

export const swapStorageMakerError = (): Readonly<Swap.Storage> => {
  const config: Swap.Storage['config'] = {
    read: unknownError,
    remove: unknownError,
    save: unknownError,
    key: 'mock-swap-config',
  }

  const clear: Swap.Storage['clear'] = unknownError

  return {
    config,
    clear,
  } as const
}
