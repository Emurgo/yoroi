import {SwapState} from './swapState'

export const mockSwapStateDefault: Readonly<SwapState> = {
  createOrder: {
    type: 'market',
    address: '',
    datum: '',
    datumHash: '',
    amounts: {
      sell: {
        quantity: '0',
        tokenId: '',
      },
      buy: {
        quantity: '0',
        tokenId: '',
      },
    },
    slippage: 1,
    protocol: 'muesliswap',
    poolId: '',
  },
  unsignedTx: undefined,
} as const
