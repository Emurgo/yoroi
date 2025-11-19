import {isNumber, isRecord, isString} from '@yoroi/common'
import {Portfolio, Notifications as YoroiNotifications} from '@yoroi/types'

import {
  getMessaging,
  requestPermission,
  subscribeToTopic,
} from '@react-native-firebase/messaging'
import * as Notifications from 'expo-notifications'
import {Linking, PermissionsAndroid} from 'react-native'

import {isAndroid} from '~/kernel/constants'
import {logger} from '~/kernel/logger/logger'
import {WalletNavigation} from '~/kernel/navigation/types'

import {BannerIds} from './banners'
import {uiStorage} from './storage'

const permissionModalStorageKey = 'triggeredNotificationsPermissionModal'

export const triggerNotificationsPermissionModal = async () => {
  const {status: existingStatus} = await Notifications.getPermissionsAsync()

  let finalStatus: Notifications.PermissionStatus = existingStatus

  if (existingStatus !== 'granted') {
    const result = await Notifications.requestPermissionsAsync()
    finalStatus = result.status
  }

  if (isAndroid && finalStatus === 'granted') {
    const androidPermissionResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    )

    if (androidPermissionResult !== PermissionsAndroid.RESULTS.GRANTED) {
      finalStatus = 'denied' as Notifications.PermissionStatus
    }
  }

  if (finalStatus === 'granted') {
    try {
      const messaging = getMessaging()
      await requestPermission(messaging)
      await subscribeToTopic(messaging, 'yoroi_campaigns')
    } catch (error) {
      logger.error('Push registration failed', {error})
    }
  }

  await uiStorage.setItem(permissionModalStorageKey, true)
}

export const getNotificationsAuthorizationStatus = async () => {
  const {status} = await Notifications.getPermissionsAsync()
  const modalNeverTriggered =
    (await uiStorage.getItem(permissionModalStorageKey)) !== true

  if (status === 'granted') {
    if (isAndroid) {
      const androidPermissionStatus = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      )
      if (!androidPermissionStatus) {
        return 'denied'
      }
    }
    return 'authorized'
  }

  if (status === 'denied') {
    return 'denied'
  }

  if (status === 'undetermined' || modalNeverTriggered) {
    return 'not_determined'
  }

  return 'denied'
}

export const handleBannerAction = async (options: {
  manager: YoroiNotifications.Manager
  id: number
  walletNavigation: WalletNavigation
}) => {
  const {manager, id, walletNavigation} = options

  const allEvents = await manager.events.read()
  const event = allEvents.find((e) => e.id === id)
  if (!event) return

  await manager.events.markAsRead(id)

  if (event.trigger !== YoroiNotifications.Trigger.Banner) return

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

export const handlePushAction = async (options: {
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

  if (event.trigger !== YoroiNotifications.Trigger.Push) return
  if (!isRecord(event.metadata.data)) return

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
      await handleInternalNavigation(event, walletNavigation, false)
    }
  }
}

export const clearNotificationInternalNavigationAction = async () => {
  await uiStorage.removeItem('triggerNotificationInternalNavigationAction')
}

export const setPendingSwapToken = async (tokenOutId: Portfolio.Token.Id) => {
  await uiStorage.setItem('pendingSwapTokenOutId', tokenOutId)
}

export const getPendingSwapToken =
  async (): Promise<Portfolio.Token.Id | null> => {
    const tokenId = await uiStorage.getItem('pendingSwapTokenOutId')
    return isString(tokenId) ? (tokenId as Portfolio.Token.Id) : null
  }

export const clearPendingSwapToken = async () => {
  await uiStorage.removeItem('pendingSwapTokenOutId')
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
  await handleInternalNavigation(event, walletNavigation, true)
}

const handleInternalNavigation = async (
  event: YoroiNotifications.PushEvent,
  walletNavigation: WalletNavigation,
  _pushNotificationHistory: boolean,
) => {
  const {metadata} = event
  if (!isRecord(metadata.data)) return

  const {data} = metadata
  if (
    isString(data.action) &&
    data.action === 'open_screen' &&
    isString(data.screen)
  ) {
    const {screen} = data

    try {
      switch (screen) {
        case 'wallet':
          walletNavigation.resetToTxHistory()
          break
        case 'staking_center':
          walletNavigation.navigateToStakingDashboard()
          break
        case 'swap': {
          const tokenOutId = isString(data.tokenOutId)
            ? (data.tokenOutId as Portfolio.Token.Id)
            : undefined
          if (tokenOutId !== undefined) {
            await setPendingSwapToken(tokenOutId)
          }
          walletNavigation.resetToSwapWithToken()
          break
        }
        case 'governance':
          walletNavigation.navigateToGovernanceCentre()
          break
        case 'discover':
          walletNavigation.navigateToDiscoverBrowserDapp()
          break
      }
    } catch (error) {
      logger.error('Navigation failed for notification', {screen, error})
    }
  }
}
