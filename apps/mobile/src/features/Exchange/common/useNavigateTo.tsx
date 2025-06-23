import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {ExchangeRoutesNavigation} from '../../../kernel/navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<ExchangeRoutesNavigation>()

  return useRef({
    exchangeSelectBuyProvider: () => navigation.navigate('exchange-select-buy-provider'),
    exchangeSelectSellProvider: () => navigation.navigate('exchange-select-sell-provider'),
  }).current
}
