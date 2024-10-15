import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {SettingsRouteNavigation} from '../../../../../kernel/navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<SettingsRouteNavigation>()

  return useRef({
    confirmTx: () => navigation.navigate('collateral-confirm-tx'),
    submittedTx: () => navigation.navigate('collateral-tx-submitted'),
    failedTx: () => navigation.navigate('collateral-tx-failed'),
  }).current
}
