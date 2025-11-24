import {useRemoteConfig} from '~/features/RemoteConfig/hooks/useRemoteConfig'

export const usePushNotificationsEnabled = () => {
  const {config, isLoading, isError} = useRemoteConfig()

  return isLoading || isError
    ? false
    : (config?.features?.pushNotifications ?? true)
}
