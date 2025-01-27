import messaging from '@react-native-firebase/messaging'
import React from 'react'
import {PermissionsAndroid} from 'react-native'
import {Notifications} from 'react-native-notifications'

import {logger} from '../../../../kernel/logger/logger'
import {notificationManager} from './notification-manager'
import {generateNotificationId, parseNotificationId, sendNotification} from './notifications'
import {usePrimaryTokenPriceChangedNotification} from './primary-token-price-changed-notification'
import {useRewardsUpdatedNotifications} from './rewards-updated-notification'
import {useTransactionReceivedNotifications} from './transaction-received-notification'

let initialized = false

const initPushNotifications = () => {
  if (initialized) return
  initialized = true
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)

  const unsubscribeFromForegroundMessage = messaging().onMessage((remoteMessage) => {
    const {notification} = remoteMessage
    if (notification && notification.title && notification.body) {
      sendNotification({
        title: notification.title,
        body: notification.body,
        id: generateNotificationId(),
      })

      logger.info('FCM Message Notification in foreground: ', {notification})
    }
  })

  const notificationOpenedSubscription = Notifications.events().registerNotificationOpened(
    (notification, completion) => {
      const payloadId = notification.identifier || notification.payload.id
      const id = parseNotificationId(payloadId)
      notificationManager.events.markAsRead(id)
      completion()
    },
  )

  return () => {
    notificationOpenedSubscription.remove()
    unsubscribeFromForegroundMessage()
  }
}

const initLocalNotifications = () => {
  notificationManager.hydrate()
  return () => {
    notificationManager.destroy()
  }
}

export const useInitNotifications = ({localEnabled, pushEnabled}: {localEnabled: boolean; pushEnabled: boolean}) => {
  React.useEffect(() => (localEnabled ? initLocalNotifications() : undefined), [localEnabled])
  React.useEffect(() => (pushEnabled ? initPushNotifications() : undefined), [pushEnabled])
  useTransactionReceivedNotifications({enabled: localEnabled})
  usePrimaryTokenPriceChangedNotification({enabled: false}) // Temporarily disabled until requested by product team
  useRewardsUpdatedNotifications({enabled: localEnabled})
  usePushNotifications({enabled: pushEnabled})
}

const usePushNotifications = ({enabled}: {enabled: boolean}) => {
  React.useEffect(() => {
    if (!enabled) return
    Notifications.registerRemoteNotifications({})
  }, [enabled])
}

messaging().setBackgroundMessageHandler((remoteMessage) => {
  if (remoteMessage.notification) {
    // Automatically shown by the OS
    logger.info(`FCM Message Notification in background`, {notification: remoteMessage.notification})
  }
  return Promise.resolve()
})
