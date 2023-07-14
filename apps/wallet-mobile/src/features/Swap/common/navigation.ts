import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {SwapTokenRouteseNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<SwapTokenRouteseNavigation>()

  return useRef({
    selectedSwapTokens: () => navigation.navigate('swap-select-token-from-to'),
  }).current
}
