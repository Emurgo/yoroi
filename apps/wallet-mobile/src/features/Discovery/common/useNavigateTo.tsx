import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {DiscoverRoutesNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<DiscoverRoutesNavigation>()

  return useRef({
    browserView: () =>
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
                    routes: [{name: 'discover'}],
                  },
                },
                {name: 'browser'},
              ],
            },
          },
        ],
      }),
  }).current
}
