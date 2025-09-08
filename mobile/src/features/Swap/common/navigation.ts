import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {SwapTokenRouteseNavigation} from '~/kernel/navigation/types'

export const useNavigateTo = () => {
  const navigation = useNavigation<SwapTokenRouteseNavigation>()
  const rootNavigation = useNavigation()
  const strings = useStrings()

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
              screen: 'review',
            },
          },
        },
      }),
    submittedTx: () =>
      navigation.navigate('submitted-tx', {
        title: strings.swap.submittedTxScreenTitle,
        message: strings.swap.submittedTxScreenText,
        buttonTitle: strings.swap.submittedTxScreenButton,
      }),
    failedTx: () =>
      navigation.navigate('failed-tx', {
        title: strings.swap.failedTxTitle,
        message: strings.swap.failedTxText,
        buttonTitle: strings.swap.failedTxButton,
      }),
    swapOpenOrders: () => navigation.navigate('orders'),
    resetToStartSwap: () => navigation.navigate('main'),
  }).current
}
