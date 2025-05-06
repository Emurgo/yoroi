import {useReceivedNotificationEvents} from '@yoroi/notifications'
import {Notifications} from '@yoroi/types'
import * as React from 'react'

import {pushNotificationsManager} from './notification-manager'

export const useWalletNotifications = () => {
  const {data: receivedNotifications = [], refetch} = useReceivedNotificationEvents()

  React.useEffect(() => {
    const subscription = pushNotificationsManager.newEvents$.subscribe(() => refetch())

    return () => {
      subscription.unsubscribe()
    }
  }, [refetch])

  const data = React.useMemo(() => {
    return receivedNotifications.filter((e) => e.trigger === Notifications.Trigger.Push)
  }, [receivedNotifications])
  return {data, refetch}
}
