import * as TaskManager from 'expo-task-manager'
import {WalletManager, walletManager} from '../../../WalletManager/wallet-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import {App, Notifications as NotificationTypes} from '@yoroi/types'
import {notificationManager} from './notification-manager'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import uuid from 'uuid'
import {sendNotification} from './notifications'
import {mountAsyncStorage} from '@yoroi/common/src'

const BACKGROUND_FETCH_TASK = 'yoroi-notifications-background-fetch'
if (!TaskManager.isTaskDefined(BACKGROUND_FETCH_TASK)) {
  const appStorage = mountAsyncStorage({path: '/'})

  TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    const now = Date.now()
    console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`)

    await syncAllWallets(walletManager)
    await checkForNewTransactions(walletManager, appStorage)

    // TODO: Be sure to return the correct result type!
    return BackgroundFetch.BackgroundFetchResult.NewData
  })
}

// 2. Register the task at some point in your app by providing the same name,
// and some configuration options for how the background fetch should behave
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
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
    if (!wallet) return
    return wallet.sync({isForced: true})
  })
  await Promise.all(promises)
}

export const checkForNewTransactions = async (walletManager: WalletManager, appStorage: App.Storage) => {
  const walletIds = [...walletManager.walletMetas.keys()]
  const notificationsAsyncStorage = appStorage.join('notifications-transaction-received-subject/')

  for (const id of walletIds) {
    const wallet = walletManager.getWalletById(id)
    if (!wallet) return
    const processed = (await notificationsAsyncStorage.getItem<string[]>(id)) || []
    const txIds = getTxIds(wallet)

    // TODO: Improve this
    if (processed.length === 0) {
      console.log(`Wallet ${id} has no processed tx ids`)
      await notificationsAsyncStorage.setItem(id, txIds)
      return
    }
    const newTxIds = txIds.filter((txId) => !processed.includes(txId))
    if (newTxIds.length === 0) {
      console.log(`Wallet ${id} has no new tx ids on network ${wallet.networkManager.network}`)
      return
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
      const notification = createTransactionReceivedNotification(metadata)
      notificationManager.events.save(notification)
      sendNotification('Transaction received from background', 'You have received a new transaction')
    })
  }
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
