import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {AppRouteNavigation, ExchangeRoutesNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<ExchangeRoutesNavigation & AppRouteNavigation>()

  return useRef({
    closeLoading: navigation.goBack,
    openLoading: () => navigation.navigate('loading'),
    exchangeSelectBuyProvider: () => navigation.navigate('exchange-select-buy-provider'),
    exchangeSelectSellProvider: () => navigation.navigate('exchange-select-sell-provider'),
    exchangeOpenOrder: () =>
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
