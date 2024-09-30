import * as React from 'react'
import {Notification, Notifications} from '@jamsinclair/react-native-notifications'
import {UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'
import {Notifications as NotificationTypes} from '@yoroi/types'
import {isNonNullable, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {notificationManagerMaker} from '@yoroi/notifications'
import {merge, Subject, switchMap} from 'rxjs'
import uuid from 'uuid'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useEffect} from 'react'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'

export const useRequestPermissions = () => {
  React.useEffect(() => {
    Notifications.registerRemoteNotifications()
  }, [])
}

export const useHandleNotification = () => {
  React.useEffect(() => {
    const s = Notifications.events().registerNotificationReceivedForeground(
      (notification: Notification, completion) => {
        console.log(`Notification received in foreground: ${notification.title} : ${notification.body}`)
        completion({alert: true, sound: true, badge: true})
      },
    )

    const s2 = Notifications.events().registerNotificationReceivedBackground(
      (notification: Notification, completion) => {
        console.log(`Notification received in background: ${notification.title} : ${notification.body}`)
        // completion({alert: true, sound: true, badge: true})
      },
    )

    return () => {
      s.remove()
      s2.remove()
    }
  }, [])
}

export const useNotificationsConfig = () => {
  const manager = useNotificationsManager()
  return useQuery(['notificationsConfig'], () => manager.config.read())
}

export const useUpdateNotificationsConfig = () => {
  const manager = useNotificationsManager()
  const mutationFn = async (newConfig: NotificationTypes.Config) => {
    await manager.config.save(newConfig)
  }

  return useMutationWithInvalidations({
    mutationFn,
    invalidateQueries: [['notificationsConfig']],
  })
}

export const useResetNotificationsConfig = (options: UseMutationOptions<NotificationTypes.Config, Error> = {}) => {
  const manager = useNotificationsManager()
  const mutationFn = async () => {
    await manager.config.reset()
    return manager.config.read()
  }

  return useMutationWithInvalidations({
    mutationFn,
    invalidateQueries: [['notificationsConfig']],
    ...options,
  })
}

export const useReceivedNotificationEvents = (
  options: UseQueryOptions<ReadonlyArray<NotificationTypes.Event>, Error> = {},
) => {
  const manager = useNotificationsManager()
  const queryFn = () => manager.events.read()
  return useQuery({
    queryKey: ['receivedNotificationEvents'],
    queryFn,
    ...options,
  })
}

export const useSendNotification = () => {
  const sendNotification = React.useCallback(postNotification, [])

  return {send: sendNotification}
}

const postNotification = (title: string, body: string) => {
  const notification = new Notification({
    title,
    body,
    sound: 'default',
  })
  Notifications.postLocalNotification(notification.payload)
}

export const useNotificationsManager = (options?: {
  subscriptions?: NotificationTypes.ManagerMakerProps['subscriptions']
}) => {
  const storage = useAsyncStorage()
  const subscriptions = options?.subscriptions

  const manager = React.useMemo(() => {
    const eventsStorage = storage.join('events/')
    const configStorage = storage.join('settings/')

    return notificationManagerMaker({
      eventsStorage,
      configStorage,
      subscriptions,
    })
  }, [storage, subscriptions])

  React.useEffect(() => {
    manager.hydrate()
    return () => {
      manager.destroy()
    }
  }, [manager])

  return manager
}

export const useMockedNotifications = () => {
  const {send} = useSendNotification()
  const [transactionReceivedSubject] = React.useState(new Subject<NotificationTypes.TransactionReceivedEvent>())
  const manager = useNotificationsManager({
    subscriptions: {[NotificationTypes.Trigger.TransactionReceived]: transactionReceivedSubject},
  })
  React.useEffect(() => {
    const subscription = manager.notification$.subscribe((notificationEvent) => {
      if (notificationEvent.trigger === NotificationTypes.Trigger.TransactionReceived) {
        send('Transaction received', 'You have received a new transaction')
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [manager, send])

  const triggerTransactionReceived = (metadata: NotificationTypes.TransactionReceivedEvent['metadata']) => {
    transactionReceivedSubject.next({
      id: uuid.v4(),
      date: new Date().toISOString(),
      isRead: false,
      trigger: NotificationTypes.Trigger.TransactionReceived,
      metadata,
    })
  }

  return {triggerTransactionReceived}
}

export const useNotifications = () => {
  useRequestPermissions()
  useHandleNotification()
  const {send} = useSendNotification()
  const transactionReceivedSubject = useTransactionReceivedNotificationSubject()
  const rewardsUpdatedSubject = useRewardsUpdatedNotificationSubject()
  const primaryTokenPriceChangedSubject = usePrimaryTokenPriceChangedNotificationSubject()
  const manager = useNotificationsManager({
    subscriptions: {
      [NotificationTypes.Trigger.TransactionReceived]: transactionReceivedSubject,
      [NotificationTypes.Trigger.RewardsUpdated]: rewardsUpdatedSubject,
      [NotificationTypes.Trigger.PrimaryTokenPriceChanged]: primaryTokenPriceChangedSubject,
    },
  })
  React.useEffect(() => {
    const subscription = manager.notification$.subscribe((notificationEvent) => {
      if (notificationEvent.trigger === NotificationTypes.Trigger.TransactionReceived) {
        console.log('Transaction received', notificationEvent.metadata)
        send('Transaction received', 'You have received a new transaction')
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [manager, send])
}

const BACKGROUND_FETCH_TASK = 'yoroi-notifications-background-fetch'

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now()

  console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`)

  postNotification('Background fetch', 'Background fetch call received')
  // Be sure to return the successful result type!
  return BackgroundFetch.BackgroundFetchResult.NewData
})

// 2. Register the task at some point in your app by providing the same name,
// and some configuration options for how the background fetch should behave
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function registerBackgroundFetchAsync() {
  console.log('registering background fetch')
  const s = await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 10, // 10 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  })
  const isRegistered = BackgroundFetch.getStatusAsync().then((status) => {
    console.log('BackgroundFetch status:', status)
  })
  return s
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background fetch calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function unregisterBackgroundFetchAsync() {
  console.log('unregistering background fetch')
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK)
}

const useTransactionReceivedNotificationSubject = () => {
  const {walletManager} = useWalletManager()
  const asyncStorage = useAsyncStorage()
  const notificationsAsyncStorage = asyncStorage.join('notifications-transacrion-received-subject/')
  const [transactionReceivedSubject] = React.useState(new Subject<NotificationTypes.TransactionReceivedEvent>())

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

      console.log(
        'all wallets done syncing',
        walletInfos.map((info) => info.id),
      )

      for (const info of walletsDoneSyncing) {
        console.log('wallet done syncing', info.id)
        const walletId = info.id
        const processed = (await notificationsAsyncStorage.getItem<string[]>(walletId)) || []
        const wallet = walletManager.getWalletById(walletId)
        if (!wallet) continue
        const txIds = getTxIds(wallet)

        if (processed.length === 0) {
          console.log(`Wallet ${walletId} has no processed tx ids`)
          await notificationsAsyncStorage.setItem(walletId, txIds)
          continue
        }
        const newTxIds = txIds.filter((txId) => !processed.includes(txId))
        if (newTxIds.length === 0) {
          console.log(`Wallet ${walletId} has no new tx ids`)
          continue
        }
        console.log('new tx ids', newTxIds)
        await notificationsAsyncStorage.setItem(walletId, [...processed, ...newTxIds])
        newTxIds.forEach((id) => {
          const metadata: NotificationTypes.TransactionReceivedEvent['metadata'] = {
            txId: id,
            isSentByUser: false,
            nextTxsCounter: 1,
            previousTxsCounter: 0,
          }
          transactionReceivedSubject.next(createTransactionReceivedNotification(metadata))
        })
      }
    })

    return () => {
      s1.unsubscribe()
    }
  }, [])
  return transactionReceivedSubject
}

const createTransactionReceivedNotification = (metadata: NotificationTypes.TransactionReceivedEvent['metadata']) => {
  return {
    id: uuid.v4(),
    date: new Date().toISOString(),
    isRead: false,
    trigger: NotificationTypes.Trigger.TransactionReceived,
    metadata,
  } as const
}

const useRewardsUpdatedNotificationSubject = () => {
  const [rewardsUpdatedSubject] = React.useState(new Subject<NotificationTypes.RewardsUpdatedEvent>())
  return rewardsUpdatedSubject
}

const usePrimaryTokenPriceChangedNotificationSubject = () => {
  const [primaryTokenPriceChangedSubject] = React.useState(
    new Subject<NotificationTypes.PrimaryTokenPriceChangedEvent>(),
  )
  return primaryTokenPriceChangedSubject
}

const getTxIds = (wallet: YoroiWallet) => {
  const ids = wallet.allUtxos.map((utxo) => utxo.tx_hash)
  return [...new Set(ids)]
}
