import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {RampOnOffRouteseNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<RampOnOffRouteseNavigation>()

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
