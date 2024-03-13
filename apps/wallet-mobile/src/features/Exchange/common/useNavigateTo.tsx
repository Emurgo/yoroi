import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {ExchangeRoutesNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<ExchangeRoutesNavigation>()

  return useRef({
    rampOnOffOpenOrder: () =>
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
  rampOnOff: {
    coin: string
    coinAmount: number
    fiat: number
    fiatAmount: number
  }
}
