import messaging from '@react-native-firebase/messaging'
import {isString} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {
  Notifications as NotificationTypes,
  Notifications as YoroiNotifications,
} from '@yoroi/types'
import React from 'react'
import {Notifications} from 'react-native-notifications'

import {logger} from '../../../kernel/logger/logger'
import {useWalletNavigation, WalletNavigation} from '../../../kernel/navigation'
import {pushNotificationsManager} from './notification-manager'
import {parseNotificationId} from './notifications'
import {usePrimaryTokenPriceChangedNotification} from './primary-token-price-changed-notification'
import {useRewardsUpdatedNotifications} from './rewards-updated-notification'
import {triggerNotificationAction} from './tools'
import {useTransactionReceivedNotifications} from './transaction-received-notification'

const initPushNotifications = (walletNavigation: WalletNavigation) => {
  const unsubscribeFromForegroundMessage = messaging().onMessage(
    (remoteMessage) => {
      const {notification} = remoteMessage

      if (
        notification &&
        isString(notification.title) &&
        isString(notification.body)
      ) {
        const pushNotification = createPushNotification({
          id: remoteMessage.sentTime ?? 0,
          title: notification.title,
          description: notification.body,
          data: remoteMessage.data,
        })
        pushNotificationsManager.events.push(pushNotification)

        logger.info('FCM Message Notification in foreground: ', {notification})
      }
    },
  )

  const notificationOpenedSubscription =
    Notifications.events().registerNotificationOpened(
      (notification, completion) => {
        const payloadId = notification.payload['google.sent_time']
        const id = parseNotificationId(payloadId)
        triggerNotificationAction({
          manager: pushNotificationsManager,
          id,
          walletNavigation,
          source: 'os',
        })
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

export const useInitNotifications = ({
  localEnabled,
  pushEnabled,
}: UseInitNotificationsProps) => {
  const manager = useNotificationManager()
  const walletNavigation = useWalletNavigation()
  React.useEffect(
    () => (localEnabled ? initLocalNotifications(manager) : undefined),
    [localEnabled, manager],
  )
  React.useEffect(
    () => (pushEnabled ? initPushNotifications(walletNavigation) : undefined),
    [walletNavigation, pushEnabled, manager],
  )
  useTransactionReceivedNotifications({enabled: localEnabled})
  usePrimaryTokenPriceChangedNotification({enabled: false}) // Temporarily disabled until requested by product team
  useRewardsUpdatedNotifications({enabled: localEnabled})
}

messaging().setBackgroundMessageHandler((remoteMessage) => {
  const remoteNotification = remoteMessage.notification
  if (
    remoteNotification &&
    isString(remoteNotification.title) &&
    isString(remoteNotification.body)
  ) {
    // Automatically shown by the OS
    pushNotificationsManager.events.push(
      createPushNotification({
        id: remoteMessage.sentTime ?? 0,
        title: remoteNotification.title,
        description: remoteNotification.body,
        data: remoteMessage.data,
      }),
    )
    logger.info(`FCM Message Notification in background`, {
      notification: remoteMessage.notification,
    })
  }
  return Promise.resolve()
})

const createPushNotification = (options: {
  title: string
  description: string
  id: number
  data?: Record<string, unknown>
}): NotificationTypes.PushEvent => {
  const {title, description, data, id} = options
  return {
    id,
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
