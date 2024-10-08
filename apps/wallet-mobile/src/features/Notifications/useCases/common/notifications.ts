import {Notification, Notifications} from '@jamsinclair/react-native-notifications'
import {Notifications as NotificationTypes} from '@yoroi/types'

export const generateNotificationId = (): number => {
  return generateRandomInteger(0, Number.MAX_SAFE_INTEGER)
}

export const parseNotificationId = (id: string): number => {
  return parseInt(id, 10)
}

const generateRandomInteger = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const displayNotificationEvent = (notificationEvent: NotificationTypes.Event) => {
  if (notificationEvent.trigger === NotificationTypes.Trigger.TransactionReceived) {
    sendNotification({
      title: 'Transaction received',
      body: 'You have received a new transaction',
      id: notificationEvent.id,
    })
  }
}

const sendNotification = (options: {title: string; body: string; id: number}) => {
  const notification = new Notification({
    title: options.title,
    body: options.body,
    sound: 'default',
  })
  Notifications.postLocalNotification(notification.payload, options.id)
}
