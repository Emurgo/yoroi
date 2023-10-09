import {mockSwapStateDefault, SwapState} from '@yoroi/swap'

import {mocks as walletMocks} from '../../../yoroi-wallets/mocks/wallet'
import {asQuantity} from '../../../yoroi-wallets/utils'

export const mocks = {
  confirmTx: {
    ...mockSwapStateDefault,
    yoroiUnsignedTx: walletMocks.yoroiUnsignedTx,
    orderData: {
      ...mockSwapStateDefault.orderData,
      amounts: {
        buy: {
          quantity: asQuantity(20467572),
          tokenId: '208a2ca888886921513cb777bb832a8dc685c04de990480151f12150.53484942414441',
        },
        sell: {quantity: asQuantity(2000000), tokenId: ''},
      },
      limitPrice: '0.089',
      selectedPool: '0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913.702083',
      pools: [
        {
          batcherFee: {quantity: asQuantity(2500000), tokenId: ''},
          deposit: {quantity: asQuantity(2000000), tokenId: ''},
          fee: '0.05',
          lpToken: {
            quantity: asQuantity(68917682),
            tokenId: '0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913.6c702083',
          },
          poolId: '0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913.702083',
          provider: 'sundaeswap',
          tokenA: {quantity: asQuantity(20630071), tokenId: ''},
          tokenB: {
            quantity: asQuantity(231696922),
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
