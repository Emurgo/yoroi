import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {TxHistoryRouteNavigation} from '../../../kernel/navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return useRef({
    showAddressDetails: () => navigation.navigate('receive-single'),
    requestSpecificAmount: () => navigation.navigate('receive-specific-amount'),
    singleAddress: () => navigation.replace('receive-single'),
    multipleAddress: () => navigation.replace('receive-multiple'),
  }).current
}
