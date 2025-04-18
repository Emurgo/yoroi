import messaging from '@react-native-firebase/messaging'
import {isRecord, isString} from '@yoroi/common'
import {Notifications as YoroiNotifications} from '@yoroi/types'
import {Linking, PermissionsAndroid, Platform} from 'react-native'
import {Notifications} from 'react-native-notifications'

import {WalletNavigation} from '../../../kernel/navigation'
import {uiStorage} from './storage'

const permissionModalStorageKey = 'triggeredNotificationsPermissionModal'

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

  if (status === messaging.AuthorizationStatus.AUTHORIZED) {
    return 'authorized'
  }

  if (status === messaging.AuthorizationStatus.DENIED) {
    return 'denied'
  }

  if (status === messaging.AuthorizationStatus.NOT_DETERMINED || modalNeverTriggered) {
    return 'not_determined'
  }

  return 'denied'
}

export const triggerNotificationAction = async (
  manager: YoroiNotifications.Manager,
  id: number,
  walletNavigation: WalletNavigation,
) => {
  const allEvents = await manager.events.read()
  const event = allEvents.find((e) => e.id === id)
  if (!event) return

  await manager.events.markAsRead(id)

  // TODO: REMOVE
  Object.assign(event, {
    trigger: YoroiNotifications.Trigger.Push,
    metadata: {
      data: {
        action: 'open_screen',
        screen: 'discover',
      },
    },
  })

  console.log('event', event)

  if (event.trigger === YoroiNotifications.Trigger.Push && isRecord(event.metadata.data)) {
    const {data} = event.metadata
    if (isString(data.action) && data.action === 'open_url' && isString(data.url)) {
      await Linking.openURL(data.url)
    }

    if (isString(data.action) && data.action === 'open_screen' && isString(data.screen)) {
      const {screen} = data
      if (screen === 'discover') {
        console.log('navigate')
        walletNavigation.navigateToDiscoverBrowserDapp()
      }
    }
  }
}
