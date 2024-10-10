import {Notifications} from '@jamsinclair/react-native-notifications'
import {NotificationBackgroundFetchResult} from '@jamsinclair/react-native-notifications'
import {useEffect} from 'react'
import {PermissionsAndroid} from 'react-native'

import {notificationManager} from './notification-manager'
import {parseNotificationId} from './notifications'
import {useTransactionReceivedNotifications} from './transaction-received-notification'

let initialized = false

const init = () => {
  if (initialized) return
  initialized = true
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
  Notifications.registerRemoteNotifications()
  Notifications.events().registerNotificationReceivedForeground((_notification, completion) => {
    completion({alert: true, sound: true, badge: true})
  })

  Notifications.events().registerNotificationReceivedBackground((_notification, completion) => {
    completion(NotificationBackgroundFetchResult.NEW_DATA)
  })

  Notifications.events().registerNotificationOpened((notification, completion) => {
    const payloadId = notification.identifier || notification.payload.id
    const id = parseNotificationId(payloadId)
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
