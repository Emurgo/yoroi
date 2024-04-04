import {NavigationProp, useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {BrowserRoutes} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<NavigationProp<BrowserRoutes>>()

  return useRef({
    goBack: () => navigation.goBack(),
    browserSearch: (isEdit = false) => {
      return navigation.navigate('app-root', {
        screen: 'browser',
        params: {
          screen: 'browser-search',
          params: {isEdit},
        },
      })
    },
    discover: () => navigation.navigate('discover', {screen: 'discover-list'}),
    browserView: () =>
      navigation.navigate('app-root', {
        screen: 'browser',
        params: {
          screen: 'browser-view',
        },
      }),
    navigation: () => navigation,
  }).current
}
