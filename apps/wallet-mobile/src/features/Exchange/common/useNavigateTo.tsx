import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {ExchangeRoutesNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<ExchangeRoutesNavigation>()

  return useRef({
    exchangeSelectProvider: () => navigation.navigate('exchange-select-provider'),
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

export type ExchangeInitRoutes = {
  exchange: {
    coin: string
    coinAmount: number
    fiat: number
    fiatAmount: number
  }
}
