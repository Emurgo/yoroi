import {Swap} from '@yoroi/types'

export function makeMockSwapStorage(): Readonly<Swap.Storage> {
  const slippage: Swap.Storage['slippage'] = {
    read: () => {
      console.debug('[swap-react] makeMockSwapStorage slippage read')
      return Promise.resolve(0.1)
    },
    remove: () => {
      console.debug('[swap-react] makeMockSwapStorage slippage remove')
      return Promise.resolve()
    },
    save: (newSlippage) => {
      console.debug(
        '[swap-react] makeMockSwapStorage slippage save',
        newSlippage,
      )
      return Promise.resolve()
    },
    key: 'mock-swap-slippage',
  }

  const clear: Swap.Storage['clear'] = () => {
    console.debug('[swap-react] makeMockSwapStorage reset')
    return Promise.all([])
  }

  return {
    slippage,
    clear,
  } as const
}
