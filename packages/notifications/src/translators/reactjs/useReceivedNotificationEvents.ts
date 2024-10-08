import {useQuery, useQueryClient, UseQueryOptions} from 'react-query'
import {Notifications as NotificationTypes} from '@yoroi/types'
import {useNotificationManager} from './NotificationProvider'
import {useEffect} from 'react'

export const useReceivedNotificationEvents = (
  options: UseQueryOptions<ReadonlyArray<NotificationTypes.Event>, Error> = {},
) => {
  const queryClient = useQueryClient()
  const manager = useNotificationManager()
  useEffect(() => {
    const subscription = manager.unreadCounterByGroup$.subscribe(() =>
      queryClient.invalidateQueries(['receivedNotificationEvents']),
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
