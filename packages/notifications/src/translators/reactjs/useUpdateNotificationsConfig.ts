import {Notifications as NotificationTypes} from '@yoroi/types'
import {useMutationWithInvalidations} from '@yoroi/common'
import {useNotificationManager} from './NotificationProvider'

export const useUpdateNotificationsConfig = () => {
  const manager = useNotificationManager()

  const mutationFn = async (newConfig: NotificationTypes.Config) => {
    await manager.config.save(newConfig)
  }

  return useMutationWithInvalidations({
    mutationFn,
    invalidateQueries: [['notificationsConfig']],
  })
}
