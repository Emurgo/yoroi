import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useResultNavigation} from '~/kernel/navigation/hooks/useResultNavigation'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {SwapTokenRouteseNavigation} from '~/kernel/navigation/types'

export const useNavigateTo = () => {
  const navigation = useNavigation<SwapTokenRouteseNavigation>()
  const rootNavigation = useNavigation()
  const strings = useStrings()
  const resultNavigation = useResultNavigation()
  const walletNavigation = useWalletNavigation()

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
      resultNavigation.showResultScreen({
        type: 'success',
        context: 'swap',
        title: strings.swap.submittedTxScreenTitle,
        message: strings.swap.submittedTxScreenText,
        primaryAction: {
          title: strings.swap.submittedTxScreenButton,
          onPress: walletNavigation.resetToTxHistory,
        },
      }),
    failedTx: () =>
      resultNavigation.showResultScreen({
        type: 'error',
        context: 'swap',
        title: strings.swap.failedTxTitle,
        message: strings.swap.failedTxText,
        primaryAction: {
          title: strings.swap.failedTxButton,
          onPress: walletNavigation.resetToTxHistory,
        },
      }),
    swapOpenOrders: () => navigation.navigate('orders'),
    resetToStartSwap: () => navigation.navigate('main'),
  }).current
}
