import {NavigationProp, useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {Portfolio2Routes} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<NavigationProp<Portfolio2Routes>>()

  return React.useRef({
    tokensList: () => navigation.navigate('portfolio-tokens-list'),
    tokenDetail: (id: string) => navigation.navigate('portfolio-token-details', {id}),
    nftsList: () => navigation.navigate('nfts'),
  } as const).current
}
