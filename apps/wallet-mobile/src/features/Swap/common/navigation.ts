import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {SwapTokenRouteseNavigation} from '../../../kernel/navigation'

export const useNavigateTo = () => {
  const swapNavigation = useNavigation<SwapTokenRouteseNavigation>()
  const navigation = useNavigation()

  return useRef({
    selectPool: () => swapNavigation.navigate('swap-select-pool'),
    editSlippage: () => swapNavigation.navigate('swap-edit-slippage'),
    selectBuyToken: () => swapNavigation.navigate('swap-select-buy-token'),
    selectSellToken: () => swapNavigation.navigate('swap-select-sell-token'),
    startSwap: () => swapNavigation.navigate('swap-start-swap', {screen: 'token-swap'}),
    confirmTx: () => swapNavigation.navigate('swap-confirm-tx'),
    reviewSwap: () => swapNavigation.navigate('swap-review'),
    submittedTx: (txId: string) => swapNavigation.navigate('swap-submitted-tx', {txId}),
    failedTx: () => swapNavigation.navigate('swap-failed-tx'),
    swapOpenOrders: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap-start-swap',
            params: {
              screen: 'orders',
            },
          },
        },
      }),
  }).current
}
