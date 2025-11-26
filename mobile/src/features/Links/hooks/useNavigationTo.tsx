import {useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {TxHistoryRouteNavigation} from '~/kernel/navigation/types'

export const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const walletNavigation = useWalletNavigation()

  return React.useRef({
    startTransfer: () => walletNavigation.navigateToStartTransfer(),
    launchDappUrl: () => walletNavigation.navigateToDiscoverBrowserDapp(),
    claimShowSuccess: () => navigation.navigate('claim-show-success'),
    back: () => navigation.goBack(),
  } as const).current
}
