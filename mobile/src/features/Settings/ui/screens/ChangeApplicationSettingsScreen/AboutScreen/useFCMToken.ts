import {getMessaging, getToken} from '@react-native-firebase/messaging'
import {useQuery} from '@tanstack/react-query'
import * as Notifications from 'expo-notifications'
import * as React from 'react'

import {isDev, isNightly} from '~/kernel/constants'

export const useFCMToken = () => {
  const [hasPermission, setHasPermission] = React.useState(false)

  React.useEffect(() => {
    Notifications.getPermissionsAsync().then(({status}) => {
      setHasPermission(status === 'granted')
    })
  }, [])

  const {data: FCMToken} = useQuery({
    queryKey: ['fcmToken'],
    queryFn: () => getToken(getMessaging()),
    enabled: (isNightly || isDev) && hasPermission,
  })

  return FCMToken
}
