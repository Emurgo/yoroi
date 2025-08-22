import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {SwapTokenRouteseNavigation} from '~/kernel/navigation/types'

export const useNavigateTo = () => {
  const navigation = useNavigation<SwapTokenRouteseNavigation>()
  const rootNavigation = useNavigation()

  return useRef({
    selectProtocol: () => navigation.navigate('select-protocol'),
    selectTokenIn: () => navigation.navigate('select-token', {direction: 'in'}),
    selectTokenOut: () =>
      navigation.navigate('select-token', {direction: 'out'}),
    startSwap: () => navigation.navigate('main'),
    orders: () => navigation.navigate('orders'),
    swapSettings: () => navigation.navigate('settings'),
    reviewSwap: () =>
      rootNavigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'swap',
            params: {
              screen: 'main',
            },
          },
        },
      }),
    submittedTx: () => navigation.navigate('submitted-tx'),
    failedTx: () => navigation.navigate('failed-tx'),
    swapOpenOrders: () => navigation.navigate('orders'),
    resetToStartSwap: () => navigation.navigate('main'),
  }).current
}
