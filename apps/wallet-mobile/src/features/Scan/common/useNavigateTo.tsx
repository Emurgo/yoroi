import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {TxHistoryRouteNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return useRef({
    showCameraPermissionDenied: () => navigation.navigate('scan-show-camera-permission-denied'),
    claimShowSuccess: () => navigation.navigate('claim-show-success'),
    send: () => navigation.navigate('send-start-tx'),
    back: () => navigation.goBack(),
  }).current
}
