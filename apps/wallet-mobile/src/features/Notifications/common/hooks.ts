import messaging from '@react-native-firebase/messaging'
import {isString} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {Notifications as NotificationTypes, Notifications as YoroiNotifications} from '@yoroi/types'
import React from 'react'
import {Notifications} from 'react-native-notifications'

import {logger} from '../../../kernel/logger/logger'
import {pushNotificationsManager} from './notification-manager'
import {generateNotificationId, parseNotificationId, sendNotification} from './notifications'
import {usePrimaryTokenPriceChangedNotification} from './primary-token-price-changed-notification'
import {useRewardsUpdatedNotifications} from './rewards-updated-notification'
import {useTransactionReceivedNotifications} from './transaction-received-notification'

const initPushNotifications = (manager: YoroiNotifications.Manager) => {
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
}

messaging().setBackgroundMessageHandler((remoteMessage) => {
  const remoteNotification = remoteMessage.notification
  if (remoteNotification && isString(remoteNotification.title) && isString(remoteNotification.body)) {
    // Automatically shown by the OS
    pushNotificationsManager.events.push(
      createPushNotification({
        title: remoteNotification.title,
        description: remoteNotification.body,
        data: remoteMessage.data,
      }),
    )
    logger.info(`FCM Message Notification in background`, {notification: remoteMessage.notification})
  }
  return Promise.resolve()
})

const createPushNotification = (options: {
  title: string
  description: string
  data?: Record<string, unknown>
}): NotificationTypes.PushEvent => {
  const {title, description, data} = options
  return {
    id: generateNotificationId(),
    date: new Date().toISOString(),
    isRead: false,
    trigger: NotificationTypes.Trigger.Push,
    metadata: {
      title,
      body: description,
      data,
    },
  } as const
}
