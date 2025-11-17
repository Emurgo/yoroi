import * as React from 'react'

import {logger} from '~/kernel/logger/logger'
import {YoroiWallet} from '~/wallets/cardano/types'

import {SyncWalletInfo} from '../common/types'
import {useWalletManager} from '../context/WalletManagerProvider'

export const useSyncWalletInfo = (walletId: YoroiWallet['id']) => {
  const {walletManager} = useWalletManager()
  const [syncWalletInfo, setSyncWalletInfo] = React.useState<
    SyncWalletInfo | undefined
  >(undefined)

  React.useEffect(() => {
    const syncWalletInfos$ = walletManager.syncWalletInfos$
    if (!syncWalletInfos$) {
      logger.debug('useSyncWalletInfo: syncWalletInfos$ not available', {
        walletId,
      })
      return
    }

    logger.debug('useSyncWalletInfo: Setting up subscription', {
      walletId,
    })
    const sub = syncWalletInfos$.subscribe((syncWalletInfos) => {
      if (!syncWalletInfos) {
        logger.debug(
          'useSyncWalletInfo: Received null/undefined syncWalletInfos',
          {
            walletId,
          },
        )
        setSyncWalletInfo(() => undefined)
        return
      }
      const info = syncWalletInfos.get(walletId)
      logger.debug('useSyncWalletInfo: Received update', {
        walletId,
        hasInfo: !!info,
        info: info
          ? {
              status: info.status,
              network: info.network,
              updatedAt: info.updatedAt,
            }
          : null,
        allWalletIds: Array.from(syncWalletInfos.keys()),
      })
      setSyncWalletInfo(() => info)
    })
    return () => {
      logger.debug('useSyncWalletInfo: Cleaning up subscription', {walletId})
      sub.unsubscribe()
    }
  }, [walletId, walletManager])

  return syncWalletInfo
}
