import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {SwapTokenRouteseNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<SwapTokenRouteseNavigation>()

  return useRef({
    selectPool: () => navigation.navigate('swap-select-pool'),
    editSlippage: () => navigation.navigate('swap-edit-slippage'),
    selectBuyToken: () => navigation.navigate('swap-select-buy-token'),
    selectSellToken: () => navigation.navigate('swap-select-sell-token'),
    startSwap: () => navigation.navigate('swap-start-swap'),
    confirmTx: () => navigation.navigate('swap-confirm-tx'),
    submittedTx: () => navigation.navigate('swap-submitted-tx'),
    failedTx: () => navigation.navigate('swap-failed-tx'),
    swapOpenOrders: () =>
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'app-root',
            state: {
              routes: [
                {name: 'wallet-selection'},
                {
                  name: 'main-wallet-routes',
                  state: {
                    routes: [
                      {
                        name: 'swap-start-swap',
                        state: {
                          routes: [{name: 'orders'}],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      }),
  }).current
}
