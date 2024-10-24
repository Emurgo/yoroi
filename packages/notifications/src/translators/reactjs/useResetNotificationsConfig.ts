import {UseMutationOptions} from 'react-query'
import {Notifications as NotificationTypes} from '@yoroi/types'
import {useMutationWithInvalidations} from '@yoroi/common'
import {useNotificationManager} from './NotificationProvider'

export const useResetNotificationsConfig = (
  options: UseMutationOptions<NotificationTypes.Config, Error> = {},
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
