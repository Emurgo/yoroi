import {mockSwapStateDefault} from '@yoroi/swap'

import {mocks as walletMocks} from '../../../yoroi-wallets/mocks/wallet'
import {asQuantity} from '../../../yoroi-wallets/utils'

type ProviderType = 'sundaeswap' | 'minswap' | 'wingriders' | 'muesliswap_v1' | 'muesliswap_v2' | 'muesliswap_v3'
type Type = 'market' | 'limit'

export const mocks = {
  confirmTx: {
    ...mockSwapStateDefault,
    yoroiUnsignedTx: walletMocks.yoroiUnsignedTx,
    createOrder: {
      address: '',
      amounts: {
        buy: {
          quantity: asQuantity(20467572) as `${number}`,
          tokenId: '208a2ca888886921513cb777bb832a8dc685c04de990480151f12150.53484942414441',
        },
        sell: {quantity: asQuantity(2000000), tokenId: ''},
      },
      datum: '',
      datumHash: '',
      limitPrice: undefined,
      selectedPool: {
        batcherFee: {quantity: asQuantity(2500000), tokenId: ''},
        deposit: {quantity: asQuantity(2000000), tokenId: ''},
        fee: '0.05',
        lastUpdate: '2023-09-08 09:56:13',
        lpToken: {
          quantity: asQuantity(68917682),
          tokenId: '0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913.6c702083',
        },
        poolId: '0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913.702083',
        price: 0.0890390378168252,
        provider: 'sundaeswap' as ProviderType,
        tokenA: {quantity: asQuantity(20630071), tokenId: ''},
        tokenB: {
          quantity: asQuantity(231696922),
          tokenId: '208a2ca888886921513cb777bb832a8dc685c04de990480151f12150.53484942414441',
        },
      },
      slippage: 1,
      type: 'market' as Type,
    },
  },
}
