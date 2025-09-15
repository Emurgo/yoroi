import {Notifications as NotificationTypes} from '@yoroi/types'

import * as Notifications from 'expo-notifications'

import {formatCurrency} from '~/features/Settings/context/CurrencyProvider'
import {currencyStorageKeyManager} from '~/kernel/storage/storages'

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
    const currencyCode = currencyStorageKeyManager.read()
    const newPrice = formatCurrency(currencyCode)(
      notificationEvent.metadata.nextPrice,
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

export const sendNotification = async (options: {
  title: string
  body: string
  id: number
}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: options.title,
      body: options.body,
      sound: 'default',
      data: {id: options.id},
    },
    trigger: null, // null means send immediately
  })
}
