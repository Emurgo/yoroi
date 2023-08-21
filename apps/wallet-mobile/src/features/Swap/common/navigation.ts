import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {SwapTokenRouteseNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<SwapTokenRouteseNavigation>()

  return useRef({
    selectPool: () => navigation.navigate('swap-select-pool'),
    editSlippage: () => navigation.navigate('swap-edit-slippage'),
    selectBuyToken: () => navigation.navigate('swap-select-buy-token'),
    selectSellToken: () => navigation.navigate('swap-select-sell-token'),
    startSwap: () => navigation.navigate('swap-start-swap'),
    confirmTx: () => navigation.navigate('swap-confirm-tx'),
  }).current
}
