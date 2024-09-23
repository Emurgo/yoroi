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
    return () => {
      s.remove()
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
  const sendNotification = React.useCallback((title: string, body: string) => {
    const notification = new Notification({
      title,
      body,
      sound: 'default',
    })
    Notifications.postLocalNotification(notification.payload)
  }, [])

  return {send: sendNotification}
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

const useTransactionReceivedNotificationSubject = () => {
  const {walletManager} = useWalletManager()
  const asyncStorage = useAsyncStorage()
  const notificationsAsyncStorage = asyncStorage.join('notifications-transacrion-received-subject/')
  const [transactionReceivedSubject] = React.useState(new Subject<NotificationTypes.TransactionReceivedEvent>())

  useEffect(() => {
    const s1 = walletManager.syncWalletInfos$.subscribe(async (status) => {
      const walletInfos = Array.from(status.values())
      const walletsDoneSyncing = walletInfos.filter((info) => info.status === 'done')

      console.log('walletsDoneSyncing', walletsDoneSyncing)
      for (const info of walletsDoneSyncing) {
        const walletId = info.id
        const processed = (await notificationsAsyncStorage.getItem<string[]>(walletId)) || []
        const wallet = walletManager.getWalletById(walletId)
        if (!wallet) return
        const utxos = wallet.allUtxos

        console.log('processed', processed)
        if (processed.length === 0) {
          await notificationsAsyncStorage.setItem(
            walletId,
            utxos.map((utxo) => utxo.utxo_id),
          )
          return
        }
        const newUtxos = utxos.filter((utxo) => !processed.includes(utxo.utxo_id))
        if (newUtxos.length === 0) return
        console.log('newUtxos', newUtxos)
        const newIds = newUtxos.map((utxo) => utxo.utxo_id)
        await notificationsAsyncStorage.setItem(walletId, [...processed, ...newIds])
        newUtxos.forEach((utxo) => {
          const metadata: NotificationTypes.TransactionReceivedEvent['metadata'] = {
            walletId,
            txId: utxo.tx_hash,
            amount: utxo.amount,
            isSentByUser: false,
            nextTxsCounter: 1,
            previousTxsCounter: 0,
          }
          transactionReceivedSubject.next({
            id: uuid.v4(),
            date: new Date().toISOString(),
            isRead: false,
            trigger: NotificationTypes.Trigger.TransactionReceived,
            metadata,
          })
        })
      }
      // console.log('syncWalletInfos', {status})
    })

    return () => {
      s1.unsubscribe()
    }
  }, [])
  return transactionReceivedSubject
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
