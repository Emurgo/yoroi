import {useNavigation} from '@react-navigation/native'

import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {VotingRegistrationRouteNavigation} from '~/kernel/navigation/types'

export const useNavigateTo = () => {
  const navigation = useNavigation<VotingRegistrationRouteNavigation>()
  const {resetToTxHistory} = useWalletNavigation()

  return {
    displayPin: () => navigation.navigate('display-pin'),
    confirmPin: () => navigation.navigate('confirm-pin'),
    qrCode: () => navigation.navigate('qr-code'),
    txHistory: () => resetToTxHistory(),
  }
}
