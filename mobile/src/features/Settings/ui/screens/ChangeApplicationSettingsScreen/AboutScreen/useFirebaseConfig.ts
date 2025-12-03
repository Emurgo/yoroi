import {getApp} from '@react-native-firebase/app'
import {getMessaging, getToken} from '@react-native-firebase/messaging'
import {useQuery} from '@tanstack/react-query'
import * as Notifications from 'expo-notifications'
import * as React from 'react'
import {AppState} from 'react-native'

import {settingsQueryKeys} from '~/common/queries'
import {useAuth} from '~/features/Auth/context/AuthProvider'

export const useFirebaseConfig = () => {
  const [hasPermission, setHasPermission] = React.useState(false)
  const {isAuthDev} = useAuth()

  const checkPermission = React.useCallback(async () => {
    const {status} = await Notifications.getPermissionsAsync()
    setHasPermission(status === 'granted')
  }, [])

  React.useEffect(() => {
    checkPermission()

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermission()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [checkPermission])

  const getFcmToken = React.useCallback(async (): Promise<string | null> => {
    try {
      const messaging = getMessaging()
      if (!messaging) {
        return null
      }
      const token = await getToken(messaging)
      return token || null
    } catch (error) {
      return null
    }
  }, [])

  const getProjectId = React.useCallback((): string => {
    try {
      const app = getApp()
      return app.options.projectId || 'unknown'
    } catch (error) {
      return 'not-available'
    }
  }, [])

  const queryKey = React.useMemo(
    () => settingsQueryKeys.firebaseConfig(isAuthDev, hasPermission),
    [isAuthDev, hasPermission],
  )

  const {data} = useQuery({
    queryKey,
    queryFn: async () => {
      const [fcmToken, projectId] = await Promise.all([
        getFcmToken(),
        Promise.resolve(getProjectId()),
      ])

      return {
        fcmToken,
        projectId,
        hasPermission,
      }
    },
    enabled: isAuthDev,
    staleTime: Infinity, // Config doesn't change during runtime
    retry: false,
  })

  return data
}
