import {Notification, Notifications} from '@jamsinclair/react-native-notifications'
import * as React from 'react'

export const sendNotification = (title: string, body: string) => {
  const notification = new Notification({
    title,
    body,
    sound: 'default',
  })
  Notifications.postLocalNotification(notification.payload)
}

export const useSendNotification = () => {
  const send = React.useCallback(sendNotification, [])
  return {send}
}
