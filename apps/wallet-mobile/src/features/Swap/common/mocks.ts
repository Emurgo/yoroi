import {tokenInfoMocks} from '@yoroi/portfolio'
import {mockSwapStateDefault, SwapState} from '@yoroi/swap'

import {mocks as walletMocks} from '../../../yoroi-wallets/mocks/wallet'

export const mocks = {
  confirmTx: {
    ...mockSwapStateDefault,
    yoroiUnsignedTx: walletMocks.yoroiUnsignedTx,
    orderData: {
      ...mockSwapStateDefault.orderData,
      amounts: {
        buy: {
          quantity: 20467572n,
          info: tokenInfoMocks.nftCryptoKitty,
        },
        sell: {quantity: 2000000n, info: tokenInfoMocks.primaryETH},
      },
      limitPrice: '0.089',
      selectedPool: '0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913.702083',
      pools: [
        {
          batcherFee: {quantity: 2500000n, tokenId: '.'},
          deposit: {quantity: 2000000n, tokenId: '.'},
          fee: '0.05',
          lpToken: {
            quantity: 68917682n,
            tokenId: '0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913.6c702083',
          },
          poolId: '0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913.702083',
          provider: 'sundaeswap',
          tokenA: {quantity: 20630071n, tokenId: '.'},
          tokenB: {
            quantity: 231696922n,
            tokenId: '208a2ca888886921513cb777bb832a8dc685c04de990480151f12150.53484942414441',
          },
          ptPriceTokenA: '0',
          ptPriceTokenB: '0',
        },
      ],
      slippage: 1,
    },
  } as SwapState,
}
