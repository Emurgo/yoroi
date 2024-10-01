import {Notification, Notifications} from '@jamsinclair/react-native-notifications'
import {useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {notificationManagerMaker} from '@yoroi/notifications'
import {Notifications as NotificationTypes} from '@yoroi/types'
import * as React from 'react'
import {UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'
import {Subject} from 'rxjs'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {
  checkForNewTransactions,
  createTransactionReceivedNotification,
  registerBackgroundFetchAsync,
  unregisterBackgroundFetchAsync,
} from './transacrtion-received'
import {useSendNotification} from './notifications'

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

    // TODO: Can we remove this?
    const s2 = Notifications.events().registerNotificationReceivedBackground((notification: Notification) => {
      console.log(`Notification received in background: ${notification.title} : ${notification.body}`)
    })

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
    transactionReceivedSubject.next(createTransactionReceivedNotification(metadata))
  }

  return {triggerTransactionReceived}
}

export const useNotifications = () => {
  useRequestPermissions()
  useHandleNotification()
  const {send} = useSendNotification()
  const transactionReceivedSubject = useTransactionReceivedNotificationSubject()

  const manager = useNotificationsManager({
    subscriptions: {
      [NotificationTypes.Trigger.TransactionReceived]: transactionReceivedSubject,
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

      await checkForNewTransactions(walletManager, asyncStorage)
    })

    return () => {
      s1.unsubscribe()
    }
  }, [walletManager, asyncStorage, transactionReceivedSubject])
  return transactionReceivedSubject
}
