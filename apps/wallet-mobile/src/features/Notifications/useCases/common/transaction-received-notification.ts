import {useAsyncStorage} from '@yoroi/common'
import {mountAsyncStorage} from '@yoroi/common/src'
import {App, Notifications as NotificationTypes} from '@yoroi/types'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import * as React from 'react'
import {Subject} from 'rxjs'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {TRANSACTION_DIRECTION} from '../../../../yoroi-wallets/types/other'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {walletManager} from '../../../WalletManager/wallet-manager'
import {notificationManager} from './notification-manager'
import {generateNotificationId} from './notifications'
import {buildProcessedNotificationsStorage} from './storage'

const backgroundTaskId = 'yoroi-transaction-received-notifications-background-fetch'
const storageKey = 'transaction-received-notification-history'

// Check is needed for hot reloading, as task can not be defined twice
if (!TaskManager.isTaskDefined(backgroundTaskId)) {
  const appStorage = mountAsyncStorage({path: '/'})
  TaskManager.defineTask(backgroundTaskId, async () => {
    await syncAllWallets()
    const notifications = await buildNotifications(appStorage)
    notifications.forEach((notification) => notificationManager.events.push(notification))
    const hasNewData = notifications.length > 0
    return hasNewData ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData
  })
}

const registerBackgroundFetchAsync = () => {
  return BackgroundFetch.registerTaskAsync(backgroundTaskId, {
    minimumInterval: 60 * 10,
    stopOnTerminate: false,
    startOnBoot: true,
  })
}

const unregisterBackgroundFetchAsync = () => {
  return BackgroundFetch.unregisterTaskAsync(backgroundTaskId)
}

const syncAllWallets = async () => {
  const ids = [...walletManager.walletMetas.keys()]
  for (const id of ids) {
    const wallet = walletManager.getWalletById(id)
    if (!wallet) continue
    await wallet.sync({})
  }
}

const buildNotifications = async (appStorage: App.Storage) => {
  const walletIds = [...walletManager.walletMetas.keys()]
  const notifications: NotificationTypes.TransactionReceivedEvent[] = []

  for (const walletId of walletIds) {
    const wallet = walletManager.getWalletById(walletId)
    if (!wallet) continue
    const storage = buildProcessedNotificationsStorage(appStorage.join(`wallet/${walletId}/${storageKey}/`))
    const processed = await storage.getValues()
    const allTxIds = getTxIds(wallet)

    if (processed.length === 0) {
      await storage.addValues(allTxIds)
      continue
    }

    const newTxIds = allTxIds.filter((txId) => !processed.includes(txId))

    if (newTxIds.length === 0) {
      continue
    }

    await storage.addValues(newTxIds)

    newTxIds.forEach((id) => {
      const metadata: NotificationTypes.TransactionReceivedEvent['metadata'] = {
        txId: id,
        isSentByUser: wallet.transactions[id]?.direction === TRANSACTION_DIRECTION.SENT,
        nextTxsCounter: newTxIds.length + processed.length,
        previousTxsCounter: processed.length,
      }
      notifications.push(createTransactionReceivedNotification(metadata))
    })
  }

  return notifications
}

const getTxIds = (wallet: YoroiWallet) => {
  const ids = wallet.allUtxos.map((utxo) => utxo.tx_hash)
  return [...new Set(ids)]
}

export const createTransactionReceivedNotification = (
  metadata: NotificationTypes.TransactionReceivedEvent['metadata'],
) => {
  return {
    id: generateNotificationId(),
    date: new Date().toISOString(),
    isRead: false,
    trigger: NotificationTypes.Trigger.TransactionReceived,
    metadata,
  } as const
}

export const transactionReceivedSubject = new Subject<NotificationTypes.TransactionReceivedEvent>()

export const useTransactionReceivedNotifications = ({enabled}: {enabled: boolean}) => {
  const {walletManager} = useWalletManager()
  const asyncStorage = useAsyncStorage()

  React.useEffect(() => {
    if (!enabled) return
    registerBackgroundFetchAsync()
    return () => {
      unregisterBackgroundFetchAsync()
    }
  }, [enabled])

  React.useEffect(() => {
    if (!enabled) return
    const subscription = walletManager.syncWalletInfos$.subscribe(async (status) => {
      const walletInfos = Array.from(status.values())
      const walletsDoneSyncing = walletInfos.filter((info) => info.status === 'done')
      const areAllDone = walletsDoneSyncing.length === walletInfos.length
      if (!areAllDone) return

      const notifications = await buildNotifications(asyncStorage)
      notifications.forEach((notification) => transactionReceivedSubject.next(notification))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [walletManager, asyncStorage, enabled])
}
