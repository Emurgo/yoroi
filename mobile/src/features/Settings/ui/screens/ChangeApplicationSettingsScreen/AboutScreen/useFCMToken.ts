import {getMessaging, getToken} from '@react-native-firebase/messaging'
import {useQuery} from '@tanstack/react-query'
import * as Notifications from 'expo-notifications'
import * as React from 'react'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {isNightly} from '~/kernel/constants'

export const useFCMToken = () => {
  const [hasPermission, setHasPermission] = React.useState(false)
  const {isAuthDev} = useAuth()

  React.useEffect(() => {
    Notifications.getPermissionsAsync().then(({status}) => {
      setHasPermission(status === 'granted')
    })
  }, [])

  const {data: FCMToken} = useQuery({
    queryKey: ['fcmToken', isAuthDev],
    queryFn: () => getToken(getMessaging()),
    enabled: (isNightly || isAuthDev) && hasPermission,
  })

  return FCMToken
}
