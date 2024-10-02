import {Notification, Notifications} from '@jamsinclair/react-native-notifications'
import {useAsyncStorage} from '@yoroi/common'
import {notificationManagerMaker} from '@yoroi/notifications'
import {Notifications as NotificationTypes} from '@yoroi/types'
import * as React from 'react'
import {useEffect} from 'react'

import {displayNotificationEvent} from './notifications'
import {useTransactionReceivedNotificationSubject} from './transaction-received-notification'

let initialized = false

const init = () => {
  if (initialized) return
  initialized = true
  Notifications.registerRemoteNotifications()
  Notifications.events().registerNotificationReceivedForeground((_notification: Notification, completion) => {
    completion({alert: true, sound: true, badge: true})
  })
  // TODO: Can we remove this?
  Notifications.events().registerNotificationReceivedBackground((notification: Notification) => {
    console.log(`Notification received in background: ${notification.title} : ${notification.body}`)
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

export const useNotifications = () => {
  useEffect(() => {
    init()
  }, [])

  const transactionReceivedSubject = useTransactionReceivedNotificationSubject()

  const manager = useNotificationsManager({
    subscriptions: {
      [NotificationTypes.Trigger.TransactionReceived]: transactionReceivedSubject,
    },
  })
  React.useEffect(() => {
    const subscription = manager.notification$.subscribe(displayNotificationEvent)
    return () => {
      subscription.unsubscribe()
    }
  }, [manager])
}
