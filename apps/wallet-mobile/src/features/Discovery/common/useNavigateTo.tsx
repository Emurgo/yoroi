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
      // return navigation.navigate('browser-search', {isEdit})
    },
    discover: () => navigation.navigate('discover', {screen: 'discover-list'}),
    browserView: (webViewTab: keyof BrowserRoutes) =>
      navigation.navigate('app-root', {
        screen: 'browser',
        params: {
          screen: webViewTab,
        },
      }),
    browserTabs: () => navigation.jumpTo('browser-tabs'),
    navigation: () => navigation,
  }).current
}
