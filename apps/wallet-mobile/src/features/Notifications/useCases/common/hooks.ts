import {Notification, Notifications} from '@jamsinclair/react-native-notifications'
import {useEffect} from 'react'
import {notificationManager} from './notification-manager'
import {useTransactionReceivedNotifications} from './transaction-received-notification'

let initialized = false

const init = () => {
  if (initialized) return
  initialized = true
  Notifications.registerRemoteNotifications()
  Notifications.events().registerNotificationReceivedForeground((_notification: Notification, completion) => {
    completion({alert: true, sound: true, badge: true})
  })
  // TODO: Can we remove this?
  Notifications.events().registerNotificationReceivedBackground((notification: Notification) => {
    console.log(`Notification received in background: ${notification.title} : ${notification.body}`)
  })
  notificationManager.hydrate()

  return () => {
    notificationManager.destroy()
  }
}

export const useNotifications = () => {
  useEffect(() => init(), [])
  useTransactionReceivedNotifications()
}
