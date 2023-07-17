import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {SwapTokenRouteseNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<SwapTokenRouteseNavigation>()

  return useRef({
    selectedSwapFromTokens: () => navigation.navigate('swap-select-token-from'),
    selectedSwapToTokens: () => navigation.navigate('swap-select-token-to'),
    swapTokens: () => navigation.navigate('swap-start'),
  }).current
}
