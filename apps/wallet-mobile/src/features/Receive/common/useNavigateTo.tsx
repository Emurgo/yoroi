import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {TxHistoryRouteNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return useRef({
    receiveDetails: () => navigation.navigate('receive-single'),
    specificAmount: () => navigation.navigate('receive-specific-amount'),
  }).current
}
