import {Swap} from '@yoroi/types'

export const swapStorageMakerNormal = (): Readonly<Swap.Storage> => {
  const settings: Swap.Storage['settings'] = {
    read: () => Promise.resolve({routingPreference: 'auto', slippage: 1}),
    remove: () => Promise.resolve(),
    save: () => Promise.resolve(),
    key: 'mock-swap-settings',
  }

  const clear: Swap.Storage['clear'] = () => Promise.resolve()

  return {
    settings,
    clear,
  } as const
}

const unknownError = () => Promise.reject('Unknown error')

export const swapStorageMakerError = (): Readonly<Swap.Storage> => {
  const settings: Swap.Storage['settings'] = {
    read: unknownError,
    remove: unknownError,
    save: unknownError,
    key: 'mock-swap-settings',
  }

  const clear: Swap.Storage['clear'] = unknownError

  return {
    settings,
    clear,
  } as const
}
