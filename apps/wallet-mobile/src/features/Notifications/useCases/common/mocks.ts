import {Notifications as NotificationTypes} from '@yoroi/types'
import * as React from 'react'
import {Subject} from 'rxjs'

import {useNotificationsManager} from './hooks'
import {displayNotificationEvent} from './notifications'
import {createTransactionReceivedNotification} from './transaction-received-notification'

export const useMockedNotifications = () => {
  const [transactionReceivedSubject] = React.useState(new Subject<NotificationTypes.TransactionReceivedEvent>())
  const manager = useNotificationsManager({
    subscriptions: {
      [NotificationTypes.Trigger.TransactionReceived]: transactionReceivedSubject,
    },
  })
  React.useEffect(() => {
    const subscription = manager.notification$.subscribe(displayNotificationEvent)
    return () => {
      subscription.unsubscribe()
    }
  }, [manager])

  const triggerTransactionReceived = (metadata: NotificationTypes.TransactionReceivedEvent['metadata']) => {
    transactionReceivedSubject.next(createTransactionReceivedNotification(metadata))
  }

  return {triggerTransactionReceived, manager}
}
