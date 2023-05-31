import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {TxHistoryRouteNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return useRef({
    selectedTokens: () => navigation.navigate('send-list-amounts-to-send'),
    addToken: () => navigation.navigate('send-select-token-from-list'),
    startTx: () => navigation.navigate('send-start-tx'),
  }).current
}
