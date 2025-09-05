import {Chain} from '@yoroi/types'

import * as React from 'react'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'

export function useLaunchRouteAfterSyncing({
  selectedNetwork,
}: {
  selectedNetwork: Chain.SupportedNetworks
}) {
  const walletNavigation = useWalletNavigation()
  const {
    walletManager,
    selected: {wallet},
  } = useWalletManager()

  const walletId = wallet?.id ?? null

  if (walletId === null)
    throw new Error('useLaunchRouteAfterSyncing: wallet cannot be null')

  React.useEffect(() => {
    const subSelectedNetwork = walletManager.selectedNetwork$.subscribe(
      (network) => {
        if (network === selectedNetwork) {
          walletNavigation.resetToWalletSelection()
        }
      },
    )
    return () => subSelectedNetwork.unsubscribe()
  }, [selectedNetwork, walletManager, walletNavigation])
}
