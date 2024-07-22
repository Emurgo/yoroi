import {NavigationProp, useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {DiscoverRoutes} from '../../../kernel/navigation'
import {ReviewTransactionParams} from '../ReviewTransaction/ReviewTransaction'

export const useNavigateTo = () => {
  const navigation = useNavigation<NavigationProp<DiscoverRoutes>>()

  return React.useRef({
    goBack: () => navigation.goBack(),
    searchDappInBrowser: () => navigation.navigate('discover-browser', {screen: 'discover-search-dapp-in-browser'}),
    selectDappFromList: () => navigation.navigate('discover-select-dapp-from-list'),
    browseDapp: () => navigation.navigate('discover-browser', {screen: 'discover-browse-dapp'}),
    reviewTransaction: (params: ReviewTransactionParams) => navigation.navigate('discover-review-tx', params),
  } as const).current
}
