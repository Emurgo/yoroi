import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {TxHistoryRouteNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return useRef({
    selectedTokens: () => navigation.navigate('send-list-amounts-to-send'),
    addToken: () => navigation.navigate('send-select-token-from-list'),
    startTx: () => navigation.navigate('send-start-tx'),
    confirmTx: () => navigation.navigate('send-confirm-tx'),
    editAmount: () => navigation.navigate('send-edit-amount'),
    reader: () => navigation.navigate('send-read-qr-code'),
    submittedTx: () => navigation.navigate('send-submitted-tx'),
    failedTx: () => navigation.navigate('send-failed-tx'),
  }).current
}
