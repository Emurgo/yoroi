import {Notification, Notifications} from '@jamsinclair/react-native-notifications'
import {Notifications as NotificationTypes} from '@yoroi/types'

export const displayNotificationEvent = (notificationEvent: NotificationTypes.Event) => {
  if (notificationEvent.trigger === NotificationTypes.Trigger.TransactionReceived) {
    console.log('Transaction received', notificationEvent.metadata)
    sendNotification('Transaction received', 'You have received a new transaction')
  }
}

const sendNotification = (title: string, body: string) => {
  const notification = new Notification({
    title,
    body,
    sound: 'default',
  })
  Notifications.postLocalNotification(notification.payload)
}
