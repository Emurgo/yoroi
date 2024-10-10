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
import {WalletManager, walletManager} from '../../../WalletManager/wallet-manager'
import {notificationManager} from './notification-manager'
import {generateNotificationId} from './notifications'

const BACKGROUND_FETCH_TASK = 'yoroi-notifications-background-fetch'

// Check is needed for hot reloading, as task can not be defined twice
if (!TaskManager.isTaskDefined(BACKGROUND_FETCH_TASK)) {
  const appStorage = mountAsyncStorage({path: '/'})
  TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    await syncAllWallets(walletManager)
    const notifications = await checkForNewTransactions(walletManager, appStorage)
    notifications.forEach((notification) => notificationManager.events.push(notification))
    const hasNewData = notifications.length > 0
    return hasNewData ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData
  })
}

const registerBackgroundFetchAsync = () => {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 10,
    stopOnTerminate: false,
    startOnBoot: true,
  })
}

const unregisterBackgroundFetchAsync = () => {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK)
}

const syncAllWallets = async (walletManager: WalletManager) => {
  const ids = [...walletManager.walletMetas.keys()]
  const promises = ids.map((id) => {
    const wallet = walletManager.getWalletById(id)
    if (!wallet) return Promise.resolve()
    return wallet.sync({isForced: true})
  })
  await Promise.all(promises)
}

const checkForNewTransactions = async (walletManager: WalletManager, appStorage: App.Storage) => {
  const walletIds = [...walletManager.walletMetas.keys()]
  const notifications: NotificationTypes.TransactionReceivedEvent[] = []

  for (const walletId of walletIds) {
    const wallet = walletManager.getWalletById(walletId)
    if (!wallet) continue
    const storage = buildStorage(appStorage, walletId)
    const processed = await storage.getProcessedTransactions()
    const allTxIds = getTxIds(wallet)

    if (processed.length === 0) {
      await storage.addProcessedTransactions(allTxIds)
      continue
    }

    const newTxIds = allTxIds.filter((txId) => !processed.includes(txId))

    if (newTxIds.length === 0) {
      continue
    }

    await storage.addProcessedTransactions(newTxIds)

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

      const notifications = await checkForNewTransactions(walletManager, asyncStorage)
      notifications.forEach((notification) => transactionReceivedSubject.next(notification))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [walletManager, asyncStorage, enabled])
}

const buildStorage = (appStorage: App.Storage, walletId: string) => {
  const storage = appStorage.join(`wallet/${walletId}/transaction-received-notification-history/`)

  const getProcessedTransactions = async () => {
    return (await storage.getItem<string[]>('processed')) || []
  }

  const addProcessedTransactions = async (txIds: string[]) => {
    const processed = await getProcessedTransactions()
    const newProcessed = [...processed, ...txIds]
    await storage.setItem('processed', newProcessed)
  }

  return {
    getProcessedTransactions,
    addProcessedTransactions,
  }
}
