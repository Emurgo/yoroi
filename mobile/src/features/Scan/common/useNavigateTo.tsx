import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {TxHistoryRouteNavigation} from '~/kernel/navigation/types'

export const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const walletNavigation = useWalletNavigation()

  return useRef({
    showCameraPermissionDenied: () =>
      navigation.navigate('scan-show-camera-permission-denied'),
    claimShowSuccess: () => navigation.navigate('claim-show-success'),
    startTransfer: () => walletNavigation.navigateToStartTransfer(),
    back: () => navigation.goBack(),
  }).current
}
