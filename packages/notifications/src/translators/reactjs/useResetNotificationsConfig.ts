import {Notifications} from '@yoroi/types'
import {useMutationWithInvalidations} from '@yoroi/common'

import {UseMutationOptions} from '@tanstack/react-query'

import {useNotificationManager} from './NotificationProvider'

export const useResetNotificationsConfig = (
  options: UseMutationOptions<Notifications.Config, Error> = {},
) => {
  const manager = useNotificationManager()
  const mutationFn = async () => {
    await manager.config.reset()
    return manager.config.read()
  }

  return useMutationWithInvalidations({
    mutationFn,
    invalidateQueries: [['notificationsConfig']],
    ...options,
  })
}
