import {mountAsyncStorage} from '@yoroi/common'
import {Notifications as NotificationTypes} from '@yoroi/types'
import {Notification, Notifications} from 'react-native-notifications'

import {
  formatCurrency,
  getCurrencySymbol,
} from '~/features/Settings/useCases/changeAppSettings/Currency/CurrencyContext'

export const generateNotificationId = (): number => {
  return generateRandomInteger(0, Number.MAX_SAFE_INTEGER)
}

export const parseNotificationId = (id: string | number): number => {
  return parseInt(String(id), 10)
}

const generateRandomInteger = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const displayNotificationEvent = async (
  notificationEvent: NotificationTypes.Event,
) => {
  if (
    notificationEvent.trigger === NotificationTypes.Trigger.TransactionReceived
  ) {
    sendNotification({
      title: 'Transaction received',
      body: 'You have received a new transaction',
      id: notificationEvent.id,
    })
  }

  if (
    notificationEvent.trigger ===
    NotificationTypes.Trigger.PrimaryTokenPriceChanged
  ) {
    const appStorage = mountAsyncStorage({path: '/'})
    const currencyCode = await getCurrencySymbol(appStorage)
    const newPrice = formatCurrency(
      notificationEvent.metadata.nextPrice,
      currencyCode,
    )

    sendNotification({
      title: 'Primary token price changed',
      body: `The price of the primary token has changed to ${newPrice}.`,
      id: notificationEvent.id,
    })
  }

  if (notificationEvent.trigger === NotificationTypes.Trigger.RewardsUpdated) {
    sendNotification({
      title: 'Rewards updated',
      body: 'Your rewards have been updated',
      id: notificationEvent.id,
    })
  }
}

export const sendNotification = (options: {
  title: string
  body: string
  id: number
}) => {
  const notification = new Notification({
    title: options.title,
    body: options.body,
    sound: 'default',
    id: options.id,
  })
  Notifications.postLocalNotification(notification.payload, options.id)
}
