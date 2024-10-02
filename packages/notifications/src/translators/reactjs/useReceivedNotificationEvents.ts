import {useQuery, UseQueryOptions} from 'react-query'
import {Notifications as NotificationTypes} from '@yoroi/types'
import {useNotificationManager} from './NotificationProvider'

export const useReceivedNotificationEvents = (
  options: UseQueryOptions<ReadonlyArray<NotificationTypes.Event>, Error> = {},
) => {
  const manager = useNotificationManager()
  const queryFn = () => manager.events.read()
  return useQuery({
    queryKey: ['receivedNotificationEvents'],
    queryFn,
    ...options,
  })
}
