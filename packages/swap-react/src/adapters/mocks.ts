import {Swap} from '@yoroi/types'

export function makeMockSwapStorage(): Swap.Storage {
  return {
    slippage: {
      read: async () => {
        console.debug('[swap-react] makeMockSwapStorage slippage read')
        return Promise.resolve(0.1)
      },
      remove: async () => {
        console.debug('[swap-react] makeMockSwapStorage slippage remove')
        return Promise.resolve()
      },
      save: async (slippage) => {
        console.debug(
          '[swap-react] makeMockSwapStorage slippage save',
          slippage,
        )
      },
    },
  }
}
