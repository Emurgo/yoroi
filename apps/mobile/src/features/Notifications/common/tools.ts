import messaging from '@react-native-firebase/messaging'
import {isNumber, isRecord, isString} from '@yoroi/common'
import {Portfolio, Notifications as YoroiNotifications} from '@yoroi/types'
import {Linking, PermissionsAndroid, Platform} from 'react-native'
import {Notifications} from 'react-native-notifications'

import {WalletNavigation} from '../../../kernel/navigation'
import {BannerIds} from './banners'
import {uiStorage} from './storage'

const permissionModalStorageKey = 'triggeredNotificationsPermissionModal'

export const triggerNotificationsPermissionModal = async () => {
  // Triggers iOS permission request
  Notifications.registerRemoteNotifications({})

  // Android requires manual permission request
  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    )
  }

  await uiStorage.setItem(permissionModalStorageKey, true)
}

export const getNotificationsAuthorizationStatus = async () => {
  const status = await messaging().hasPermission()
  const modalNeverTriggered =
    (await uiStorage.getItem(permissionModalStorageKey)) !== true

  if (status === messaging.AuthorizationStatus.AUTHORIZED) {
    return 'authorized'
  }

  if (status === messaging.AuthorizationStatus.DENIED) {
    return 'denied'
  }

  if (
    status === messaging.AuthorizationStatus.NOT_DETERMINED ||
    modalNeverTriggered
  ) {
    return 'not_determined'
  }

  return 'denied'
}

export const triggerNotificationAction = async (options: {
  manager: YoroiNotifications.Manager
  id: number
  walletNavigation: WalletNavigation
  source: 'os' | 'app'
}) => {
  const {manager, id, walletNavigation, source} = options
  const allEvents = await manager.events.read()
  const event = allEvents.find((e) => e.id === id)
  if (!event) return

  await manager.events.markAsRead(id)

  if (event.trigger === YoroiNotifications.Trigger.Banner) {
    switch (event.id) {
      case BannerIds.BuyCrypto:
      case BannerIds.TestAda:
        walletNavigation.navigateToExchange()
        break
      case BannerIds.GovernanceParticipation:
        walletNavigation.navigateToGovernanceCentre()
        break
      case BannerIds.UtxoConsolidation:
        walletNavigation.navigateToUtxoConsolidation()
        break
      default:
    }
  }

  if (
    event.trigger === YoroiNotifications.Trigger.Push &&
    isRecord(event.metadata.data)
  ) {
    const {data} = event.metadata
    if (
      isString(data.action) &&
      data.action === 'open_url' &&
      isString(data.url)
    ) {
      await Linking.openURL(data.url)
    }

    if (isString(data.action) && data.action === 'open_screen') {
      if (source === 'os') {
        await uiStorage.setItem(
          'triggerNotificationInternalNavigationAction',
          event.id,
        )
      } else {
        handleInternalNavigation(event, walletNavigation, false)
      }
    }
  }
}

export const clearNotificationInternalNavigationAction = async () => {
  await uiStorage.removeItem('triggerNotificationInternalNavigationAction')
}

export const shouldHandleNotificationInternalNavigationAction = async () => {
  const id = await uiStorage.getItem(
    'triggerNotificationInternalNavigationAction',
  )
  return isNumber(id)
}

export const handleNotificationInternalNavigationAction = async (
  manager: YoroiNotifications.Manager,
  walletNavigation: WalletNavigation,
) => {
  const id = await uiStorage.getItem(
    'triggerNotificationInternalNavigationAction',
  )
  if (!isNumber(id)) return
  await clearNotificationInternalNavigationAction()
  const allEvents = await manager.events.read()
  const event = allEvents.find((e) => e.id === id)
  if (!event) return

  if (event.trigger !== YoroiNotifications.Trigger.Push) return
  handleInternalNavigation(event, walletNavigation, true)
}

const handleInternalNavigation = (
  event: YoroiNotifications.PushEvent,
  walletNavigation: WalletNavigation,
  pushNotificationHistory: boolean,
) => {
  if (!isRecord(event.metadata.data)) return

  const {data} = event.metadata
  if (
    isString(data.action) &&
    data.action === 'open_screen' &&
    isString(data.screen)
  ) {
    const {screen} = data
    switch (screen) {
      case 'wallet':
        walletNavigation.resetToTxHistory()
        break
      case 'staking_center':
        walletNavigation.navigateToStakingDashboard()
        break
      case 'swap':
        walletNavigation.navigateToSwap(
          (data.tokenOutId as Portfolio.Token.Id) || undefined,
        )
        break
      case 'governance':
        walletNavigation.navigateToGovernanceCentre()
        break
      case 'discover':
        if (pushNotificationHistory) walletNavigation.navigateToNotifications()
        walletNavigation.navigateToDiscoverBrowserDapp()
        break
    }
  }
}
