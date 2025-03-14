import {useQuery, UseQueryOptions} from 'react-query'
import {useNotificationManager} from './NotificationProvider'
import {Notifications} from '@yoroi/types'

const queryKey = ['notificationsConfig'] as const

type Options = UseQueryOptions<
  Notifications.Config,
  Error,
  Notifications.Config,
  typeof queryKey
>

export const useNotificationsConfig = (options: Options = {}) => {
  const manager = useNotificationManager()
  const queryFn = () => manager.config.read()
  return useQuery({...options, queryKey, queryFn})
}
