import {useRemoteConfig} from '~/features/RemoteConfig/hooks/useRemoteConfig'

export const usePushNotificationsEnabled = () => {
  const {config} = useRemoteConfig()

  return config?.features?.pushNotifications === true
}


