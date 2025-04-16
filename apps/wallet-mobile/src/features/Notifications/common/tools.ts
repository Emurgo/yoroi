import messaging from '@react-native-firebase/messaging'
import {PermissionsAndroid, Platform} from 'react-native'
import {Notifications} from 'react-native-notifications'

import {uiStorage} from './storage'

const permissionModalStorageKey = 'triggerredNotificationsPermissionModal'

export const triggerNotificationsPermissionModal = async () => {
  // Triggers iOS permission request
  Notifications.registerRemoteNotifications({})

  // Android requires manual permission request
  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
  }

  await uiStorage.setItem(permissionModalStorageKey, true)
}

export const getNotificationsAuthorizationStatus = async () => {
  const status = await messaging().hasPermission()
  const modalNeverTriggered = (await uiStorage.getItem(permissionModalStorageKey)) !== true

  const isAuthorized = status === messaging.AuthorizationStatus.AUTHORIZED
  const isUndetermined = status === messaging.AuthorizationStatus.NOT_DETERMINED || modalNeverTriggered

  return isAuthorized ? 'authorized' : isUndetermined ? 'not_determined' : 'denied'
}
