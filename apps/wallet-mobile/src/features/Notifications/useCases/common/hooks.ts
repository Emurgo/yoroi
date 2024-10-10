import {Notifications} from '@jamsinclair/react-native-notifications'
import {NotificationBackgroundFetchResult} from '@jamsinclair/react-native-notifications'
import {useEffect} from 'react'

import {notificationManager} from './notification-manager'
import {parseNotificationId} from './notifications'
import {useTransactionReceivedNotifications} from './transaction-received-notification'

let initialized = false

const init = () => {
  if (initialized) return
  initialized = true
  Notifications.registerRemoteNotifications()
  Notifications.events().registerNotificationReceivedForeground((_notification, completion) => {
    completion({alert: true, sound: true, badge: true})
  })

  Notifications.events().registerNotificationReceivedBackground((_notification, completion) => {
    completion(NotificationBackgroundFetchResult.NEW_DATA)
  })

  Notifications.events().registerNotificationOpened((notification, completion) => {
    const id = parseNotificationId(notification.identifier)
    notificationManager.events.markAsRead(id)
    completion()
  })

  notificationManager.hydrate()

  return () => {
    notificationManager.destroy()
  }
}

export const useInitNotifications = ({enabled}: {enabled: boolean}) => {
  useEffect(() => (enabled ? init() : undefined), [enabled])
  useTransactionReceivedNotifications({enabled})
}
