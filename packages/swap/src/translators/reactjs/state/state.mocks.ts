import {SwapState, defaultSwapState} from './state'

export const mockSwapStateDefault: SwapState = {
  orderData: {
    ...defaultSwapState.orderData,
    type: 'market',
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
    limitPrice: '0',
    slippage: 1,
    selectedPoolId: undefined,
    calculations: [],
    lpTokenHeld: undefined,
    frontendFeeTiers: [],
    pools: [],
  },
  unsignedTx: undefined,
} as const
