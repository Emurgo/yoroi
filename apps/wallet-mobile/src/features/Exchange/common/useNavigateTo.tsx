import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {AppRouteNavigation, ExchangeRoutesNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<ExchangeRoutesNavigation & AppRouteNavigation>()

  return useRef({
    exchangeSelectBuyProvider: () => navigation.navigate('exchange-select-buy-provider'),
    exchangeErrorScreen: () => navigation.navigate('exchange-error-screen'),
    exchangeSelectSellProvider: () => navigation.navigate('exchange-select-sell-provider'),
    exchangeCreateOrder: () => navigation.navigate('exchange-create-order'),
    historyList: () =>
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
                        name: 'history-list',
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
