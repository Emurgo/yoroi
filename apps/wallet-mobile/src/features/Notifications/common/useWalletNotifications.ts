import {useReceivedNotificationEvents} from '@yoroi/notifications'
import {Notifications} from '@yoroi/types'
import * as React from 'react'

export const useWalletNotifications = () => {
  const {data: receivedNotifications = [], refetch} = useReceivedNotificationEvents()

  const data = React.useMemo(() => {
    return receivedNotifications.filter((e) => e.trigger === Notifications.Trigger.Push)
  }, [receivedNotifications])
  return {data, refetch}
}
