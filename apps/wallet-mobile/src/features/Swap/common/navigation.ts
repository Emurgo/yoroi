import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {SwapTokenRouteseNavigation} from '../../../kernel/navigation'

export const useNavigateTo = () => {
  const swapNavigation = useNavigation<SwapTokenRouteseNavigation>()
  const navigation = useNavigation()

  return useRef({
    selectProtocol: () => swapNavigation.navigate('swap-select-protocol'),
    selectTokenIn: () => swapNavigation.navigate('swap-select-token', {direction: 'in'}),
    selectTokenOut: () => swapNavigation.navigate('swap-select-token', {direction: 'out'}),
    startSwap: () => swapNavigation.navigate('swap-main'),
    orders: () => swapNavigation.navigate('swap-orders'),
    swapSettings: () => swapNavigation.navigate('swap-settings'),
    reviewSwap: () => swapNavigation.navigate('swap-review'),
    submittedTx: () => swapNavigation.navigate('swap-submitted-tx'),
    failedTx: () => swapNavigation.navigate('swap-failed-tx'),
    swapOpenOrders: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap-orders',
          },
        },
      }),
    resetToStartSwap: () =>
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap-main',
          },
        },
      }),
  }).current
}
