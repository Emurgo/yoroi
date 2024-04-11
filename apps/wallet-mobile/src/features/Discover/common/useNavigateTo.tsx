import {NavigationProp, useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {DiscoverRoutes} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<NavigationProp<DiscoverRoutes>>()

  return React.useRef({
    goBack: () => navigation.goBack(),
    searchDappInBrowser: ({isEdit = false} = {}) => {
      return navigation.navigate('discover-browser', {screen: 'discover-search-dapp-in-browser', params: {isEdit}})
    },
    selectDappFromList: () => navigation.navigate('discover-select-dapp-from-list'),
    browseDapp: () => navigation.navigate('discover-browser', {screen: 'discover-browse-dapp'}),
    navigation: () => navigation,
  }).current
}
