import {isString} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {
  Notifications as NotificationTypes,
  Notifications as YoroiNotifications,
} from '@yoroi/types'

import messaging from '@react-native-firebase/messaging'
import * as Notifications from 'expo-notifications'
import * as React from 'react'

import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'

import {pushNotificationsManager} from './notification-manager'
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

const initPushNotifications = (
  walletNavigation: ReturnType<typeof useWalletNavigation>,
) => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })

  const registerFirebaseIfPermissionsGranted = async () => {
    try {
      const {status} = await Notifications.getPermissionsAsync()
      if (status === 'granted') {
        await messaging().registerDeviceForRemoteMessages()
        await messaging().requestPermission()
      }
    } catch (error) {
      logger.error('Firebase registration failed', {error})
    }
  }

  registerFirebaseIfPermissionsGranted()

  const firebaseForegroundUnsubscribe = messaging().onMessage(
    async (remoteMessage) => {
      const {status} = await Notifications.getPermissionsAsync()

      if (status !== 'granted') {
        logger.info('Firebase message received but notifications are disabled')
        return
      }

      logger.info('Firebase message received in foreground: ', {remoteMessage})

      const title = remoteMessage.notification?.title
      const body = remoteMessage.notification?.body
      const data = remoteMessage.data

      if (isString(title) && isString(body)) {
        const pushNotification = createPushNotification({
          id: Date.now(),
          title,
          description: body,
          data: data as Record<string, unknown>,
        })
        await pushNotificationsManager.events.push(pushNotification)

        logger.info(
          'Firebase campaign notification added to Yoroi notifications: ',
          {
            title,
            body,
            data,
            messageId: remoteMessage.messageId,
          },
        )
      } else if (data) {
        logger.info('Firebase data-only message received: ', {
          data,
          messageId: remoteMessage.messageId,
        })
      }
    },
  )

  const processOpenData = async (
    data: Record<string, unknown> | undefined,
    title?: string,
    body?: string,
  ) => {
    if (!data) return
    if (typeof data === 'object' && data !== null) {
      logger.info('Notification opened with data', {data, title, body})
      const id = Date.now()
      const pushEvent = createPushNotification({
        id,
        title: title ?? 'Notification',
        description: body ?? '',
        data: data as Record<string, unknown>,
      })
      await pushNotificationsManager.events.push(pushEvent)

      await triggerNotificationAction({
        manager: pushNotificationsManager,
        id,
        walletNavigation,
        source: 'os',
      })
    }
  }

  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data =
        (response?.notification?.request?.content?.data as
          | Record<string, unknown>
          | undefined) ?? undefined
      const title = response?.notification?.request?.content?.title ?? undefined
      const body = response?.notification?.request?.content?.body ?? undefined
      processOpenData(data, title, body)
    })

  const firebaseOpenUnsubscribe = messaging().onNotificationOpenedApp(
    async (remoteMessage) => {
      logger.info('FCM onNotificationOpenedApp fired', {remoteMessage})
      const data = remoteMessage?.data as Record<string, unknown> | undefined
      const title = remoteMessage?.notification?.title
      const body = remoteMessage?.notification?.body
      await processOpenData(data, title ?? undefined, body ?? undefined)
    },
  )

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        logger.info('FCM getInitialNotification found message', {remoteMessage})
        const data = remoteMessage?.data as Record<string, unknown> | undefined
        const title = remoteMessage?.notification?.title
        const body = remoteMessage?.notification?.body
        processOpenData(data, title ?? undefined, body ?? undefined)
      }
    })

  return () => {
    firebaseForegroundUnsubscribe()
    firebaseOpenUnsubscribe()
    responseListener?.remove()
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
