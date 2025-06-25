import {Notifications} from '@yoroi/types'

import {useQuery, UseQueryOptions} from '@tanstack/react-query'

import {useNotificationManager} from './NotificationProvider'

const queryKey = ['notificationsConfig'] as const

type Options = Partial<
  UseQueryOptions<
    Notifications.Config,
    Error,
    Notifications.Config,
    typeof queryKey
  >
>

export const useNotificationsConfig = (options: Options = {}) => {
  const manager = useNotificationManager()
  const queryFn = () => manager.config.read()
  return useQuery({...options, queryKey, queryFn})
}
