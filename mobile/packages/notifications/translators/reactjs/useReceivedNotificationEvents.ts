import {Notifications as NotificationTypes} from '@yoroi/types'

import {UseQueryOptions, useQuery, useQueryClient} from '@tanstack/react-query'
import * as React from 'react'

import {useNotificationManager} from './NotificationProvider'

export const useReceivedNotificationEvents = (
  options: Partial<
    UseQueryOptions<ReadonlyArray<NotificationTypes.Event>, Error>
  > = {},
) => {
  const queryClient = useQueryClient()
  const manager = useNotificationManager()
  React.useEffect(() => {
    const subscription = manager.unreadCounterByGroup$.subscribe(() =>
      queryClient.invalidateQueries({queryKey: ['receivedNotificationEvents']}),
    )
    return () => {
      subscription.unsubscribe()
    }
  }, [manager, queryClient])

  const queryFn = () => manager.events.read()
  return useQuery({
    queryKey: ['receivedNotificationEvents'],
    queryFn,
    ...options,
  })
}
