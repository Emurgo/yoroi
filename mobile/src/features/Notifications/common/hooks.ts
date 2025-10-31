import {useNotificationManager} from '@yoroi/notifications'
import {
  Notifications as NotificationTypes,
  Notifications as YoroiNotifications,
} from '@yoroi/types'

import messaging from '@react-native-firebase/messaging'
import * as React from 'react'

import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'

import {pushNotificationsManager} from './notification-manager'
import {parseNotificationId} from './notifications'
import {usePrimaryTokenPriceChangedNotification} from './primary-token-price-changed-notification'
import {useRewardsUpdatedNotifications} from './rewards-updated-notification'
import {triggerNotificationAction} from './tools'
import {useTransactionReceivedNotifications} from './transaction-received-notification'

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

function initFCMPushNotifications(
  walletNavigation: ReturnType<typeof useWalletNavigation>,
) {
  // Request FCM permission
  messaging()
    .requestPermission()
    .then((authStatus) => {
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL

      if (enabled) {
        logger.info('FCM: Push notification permission enabled')
      }
    })
    .catch((error) => {
      logger.error('FCM: Error requesting permission:', error)
    })

  // Get FCM token
  messaging()
    .getToken()
    .then((token) => {
      logger.info(`FCM Device Token: ${token}`)
      // TODO: Send this token to your backend
    })
    .catch((error) => {
      logger.error('FCM: Error getting token:', error)
    })

  // Handle foreground messages
  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    logger.info('FCM: Foreground message received', {
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
    })

    const {notification, data} = remoteMessage
    if (notification?.title && notification?.body) {
      const pushNotification = createPushNotification({
        id: Date.now(),
        title: notification.title,
        description: notification.body,
        data: data as Record<string, unknown>,
      })
      pushNotificationsManager.events.push(pushNotification)
    }
  })

  // Handle notification opened app
  const unsubscribeOpened = messaging().onNotificationOpenedApp(
    (remoteMessage) => {
      logger.info('FCM: Notification opened app', {
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
      })

      const id = parseNotificationId(Date.now().toString())
      triggerNotificationAction({
        manager: pushNotificationsManager,
        id,
        walletNavigation,
        source: 'os',
      })
    },
  )

  // Check if app was opened by a notification
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        logger.info('FCM: App opened by notification', {
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
        })

        const id = parseNotificationId(Date.now().toString())
        triggerNotificationAction({
          manager: pushNotificationsManager,
          id,
          walletNavigation,
          source: 'os',
        })
      }
    })
    .catch((error) => {
      logger.error('FCM: Error getting initial notification:', error)
    })

  return () => {
    unsubscribeForeground()
    unsubscribeOpened()
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
    () =>
      pushEnabled ? initFCMPushNotifications(walletNavigation) : undefined,
    [walletNavigation, pushEnabled],
  )
  useTransactionReceivedNotifications({enabled: localEnabled})
  usePrimaryTokenPriceChangedNotification({enabled: false}) // Temporarily disabled until requested by product team
  useRewardsUpdatedNotifications({enabled: localEnabled})
}
