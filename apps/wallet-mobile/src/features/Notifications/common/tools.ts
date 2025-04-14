import messaging from '@react-native-firebase/messaging'
import {PermissionsAndroid, Platform} from 'react-native'
import {Notifications} from 'react-native-notifications'

export const triggerNotificationsPermissionModal = async () => {
  // Triggers iOS permission request
  Notifications.registerRemoteNotifications({})

  // Android requires manual permission request
  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
  }
}

export const hasAuthorizedNotifications = async () => {
  const status = await messaging().requestPermission()
  return status === messaging.AuthorizationStatus.AUTHORIZED
}
