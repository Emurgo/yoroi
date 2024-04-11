import {NavigationProp, useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {DiscoverRoutes} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<NavigationProp<DiscoverRoutes>>()

  return useRef({
    goBack: () => navigation.goBack(),
    browserSearch: (isEdit = false) => {
      return navigation.navigate('browser', {
        screen: 'browser-search',
        params: {isEdit},
      })
    },
    discover: () => navigation.navigate('discover-list'),
    browserView: () =>
      navigation.navigate('browser', {
        screen: 'browser-view',
      }),
    navigation: () => navigation,
  }).current
}
