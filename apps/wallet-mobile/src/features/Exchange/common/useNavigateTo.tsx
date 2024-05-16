import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {ExchangeRoutesNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<ExchangeRoutesNavigation>()

  return useRef({
    exchangeSelectBuyProvider: () => navigation.navigate('exchange-select-buy-provider'),
    exchangeSelectSellProvider: () => navigation.navigate('exchange-select-sell-provider'),
    exchangeOpenOrder: () =>
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'manage-wallets',
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
