import {useAsyncStorage} from '@yoroi/common'
import {mountAsyncStorage} from '@yoroi/common/src'
import {App, Notifications as NotificationTypes} from '@yoroi/types'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import * as React from 'react'
import {Subject} from 'rxjs'
import uuid from 'uuid'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {WalletManager, walletManager} from '../../../WalletManager/wallet-manager'
import {notificationManager} from './notification-manager'

const BACKGROUND_FETCH_TASK = 'yoroi-notifications-background-fetch'
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

export async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 10, // 10 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  })
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background fetch calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
export async function unregisterBackgroundFetchAsync() {
  console.log('unregistering background fetch')
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

export const checkForNewTransactions = async (walletManager: WalletManager, appStorage: App.Storage) => {
  const walletIds = [...walletManager.walletMetas.keys()]
  const notificationsAsyncStorage = appStorage.join('notifications-transaction-received-subject/')
  const notifications: NotificationTypes.TransactionReceivedEvent[] = []

  for (const id of walletIds) {
    const wallet = walletManager.getWalletById(id)
    if (!wallet) continue
    const processed = (await notificationsAsyncStorage.getItem<string[]>(id)) || []
    const txIds = getTxIds(wallet)

    if (processed.length === 0) {
      console.log(`Wallet ${id} has no processed tx ids`)
      await notificationsAsyncStorage.setItem(id, txIds)
      continue
    }

    const newTxIds = txIds.filter((txId) => !processed.includes(txId))

    if (newTxIds.length === 0) {
      console.log(`Wallet ${id} has no new tx ids on network ${wallet.networkManager.network}`)
      continue
    }
    console.log('new tx ids', newTxIds)
    await notificationsAsyncStorage.setItem(id, [...processed, ...newTxIds])

    newTxIds.forEach((id) => {
      const metadata: NotificationTypes.TransactionReceivedEvent['metadata'] = {
        txId: id,
        isSentByUser: false,
        nextTxsCounter: 1,
        previousTxsCounter: 0,
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
    id: uuid.v4(),
    date: new Date().toISOString(),
    isRead: false,
    trigger: NotificationTypes.Trigger.TransactionReceived,
    metadata,
  } as const
}

export const transactionReceivedSubject = new Subject<NotificationTypes.TransactionReceivedEvent>()

export const useTransactionReceivedNotifications = () => {
  const {walletManager} = useWalletManager()
  const asyncStorage = useAsyncStorage()

  React.useEffect(() => {
    registerBackgroundFetchAsync()
    return () => {
      unregisterBackgroundFetchAsync()
    }
  }, [])

  React.useEffect(() => {
    const s1 = walletManager.syncWalletInfos$.subscribe(async (status) => {
      const walletInfos = Array.from(status.values())
      const walletsDoneSyncing = walletInfos.filter((info) => info.status === 'done')
      const areAllDone = walletsDoneSyncing.length === walletInfos.length
      if (!areAllDone) return

      const notifications = await checkForNewTransactions(walletManager, asyncStorage)
      notifications.forEach((notification) => transactionReceivedSubject.next(notification))
    })

    return () => {
      s1.unsubscribe()
    }
  }, [walletManager, asyncStorage, transactionReceivedSubject])
  return transactionReceivedSubject
}
