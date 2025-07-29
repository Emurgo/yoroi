import * as React from 'react'

import {YoroiWallet} from '~/wallets/cardano/types'
import {SyncWalletInfo} from '../common/types'
import {useWalletManager} from '../context/WalletManagerProvider'

export const useSyncWalletInfo = (walledId: YoroiWallet['id']) => {
  const {walletManager} = useWalletManager()
  const [syncWalletInfo, setSyncWalletInfo] = React.useState<
    SyncWalletInfo | undefined
  >()

  React.useEffect(() => {
    const sub = walletManager.syncWalletInfos$.subscribe((syncWalletInfos) => {
      setSyncWalletInfo(() => syncWalletInfos.get(walledId))
    })
    return () => sub.unsubscribe()
  }, [syncWalletInfo, walledId, walletManager.syncWalletInfos$])

  return syncWalletInfo
}
