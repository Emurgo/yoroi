import {tokenInfoMocks} from '../../../tokenInfo.mocks'
import {SwapState, defaultSwapState} from './state'

export const mockSwapStateDefault: SwapState = {
  orderData: {
    ...defaultSwapState.orderData,
    tokens: {
      ...defaultSwapState.orderData.tokens,
      ptInfo: tokenInfoMocks.pt,
    },
    type: 'market',
    amounts: {},
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
