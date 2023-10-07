import {SwapState} from './state'

export const mockSwapStateDefault: SwapState = {
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
    limitPrice: '0',
    marketPrice: '0',
    slippage: 1,
    selectedPool: {
      provider: 'minswap',
      fee: '',
      tokenA: {tokenId: '', quantity: '0'},
      tokenB: {tokenId: '', quantity: '0'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      price: 0,
      batcherFee: {tokenId: '', quantity: '0'},
      deposit: {tokenId: '', quantity: '0'},
      poolId: '',
      lpToken: {tokenId: '', quantity: '0'},
    },
  },
  unsignedTx: undefined,
} as const
