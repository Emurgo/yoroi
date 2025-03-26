import messaging from '@react-native-firebase/messaging'
import {useNotificationManager} from '@yoroi/notifications'
import {Notifications as YoroiNotifications} from '@yoroi/types'
import React from 'react'
import {PermissionsAndroid, Platform} from 'react-native'
import {Notifications} from 'react-native-notifications'

import {logger} from '../../../../kernel/logger/logger'
import {generateNotificationId, parseNotificationId, sendNotification} from './notifications'
import {usePrimaryTokenPriceChangedNotification} from './primary-token-price-changed-notification'
import {useRewardsUpdatedNotifications} from './rewards-updated-notification'
import {useTransactionReceivedNotifications} from './transaction-received-notification'

let initialized = false

const initPushNotifications = (manager: YoroiNotifications.Manager) => {
  initialized = true
  if (Platform.OS === 'android' && !initialized) {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
  }

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
      manager.events.markAsRead(id)
      completion()
    },
  )

  return () => {
    notificationOpenedSubscription.remove()
    unsubscribeFromForegroundMessage()
  }
}

const initLocalNotifications = (manager: YoroiNotifications.Manager) => {
  manager.hydrate()
  return () => {
    manager.destroy()
  }
}

type UseInitNotificationsProps = {
  localEnabled: boolean
  pushEnabled: boolean
}

export const useInitNotifications = ({localEnabled, pushEnabled}: UseInitNotificationsProps) => {
  const manager = useNotificationManager()
  React.useEffect(() => (localEnabled ? initLocalNotifications(manager) : undefined), [localEnabled, manager])
  React.useEffect(() => (pushEnabled ? initPushNotifications(manager) : undefined), [pushEnabled, manager])
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
