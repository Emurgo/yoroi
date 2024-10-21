import {useQuery} from 'react-query'
import {useNotificationManager} from './NotificationProvider'

export const useNotificationsConfig = () => {
  const manager = useNotificationManager()
  return useQuery(['notificationsConfig'], () => manager.config.read())
}
