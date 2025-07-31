import {isString} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {
  Notifications as NotificationTypes,
  Notifications as YoroiNotifications,
} from '@yoroi/types'
import * as Notifications from 'expo-notifications'
import React from 'react'
import {Notifications as RNNotifications} from 'react-native-notifications'

import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation, WalletNavigation} from '~/kernel/navigation'
import {pushNotificationsManager} from './notification-manager'
import {parseNotificationId} from './notifications'
import {usePrimaryTokenPriceChangedNotification} from './primary-token-price-changed-notification'
import {useRewardsUpdatedNotifications} from './rewards-updated-notification'
import {triggerNotificationAction} from './tools'
import {useTransactionReceivedNotifications} from './transaction-received-notification'

const initPushNotifications = (walletNavigation: WalletNavigation) => {
  // Configure Expo notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })

  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      const {title, body, data} = notification.request.content

      if (isString(title) && isString(body)) {
        const pushNotification = createPushNotification({
          id: Date.now(),
          title,
          description: body,
          data: data as Record<string, unknown>,
        })
        pushNotificationsManager.events.push(pushNotification)

        logger.info('Expo Notification received: ', {title, body})
      }
    },
  )

  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const {title, body, data} = response.notification.request.content
      const id = parseNotificationId(Date.now().toString())
      triggerNotificationAction({
        manager: pushNotificationsManager,
        id,
        walletNavigation,
        source: 'os',
      })
    })

  const notificationOpenedSubscription =
    RNNotifications.events().registerNotificationOpened(
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
    notificationListener?.remove()
    responseListener?.remove()
    notificationOpenedSubscription.remove()
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
