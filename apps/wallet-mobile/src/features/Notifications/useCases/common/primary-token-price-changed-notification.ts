import {isRight, useAsyncStorage} from '@yoroi/common'
import {App, Notifications as NotificationTypes} from '@yoroi/types'
import * as React from 'react'
import {Subject} from 'rxjs'

import {time} from '../../../../kernel/constants'
import {fetchPtPriceActivity} from '../../../../yoroi-wallets/cardano/usePrimaryTokenActivity'
import {getCurrencySymbol} from '../../../Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {notificationManager} from './notification-manager'
import {generateNotificationId} from './notifications'
import {buildProcessedNotificationsStorage} from './storage'

const refetchIntervalInSeconds = 60 * 10
const refetchIntervalInMilliseconds = refetchIntervalInSeconds * 1000
const storageKey = 'notifications/primary-token-price-changed/'

const buildNotifications = async (
  appStorage: App.Storage,
): Promise<NotificationTypes.PrimaryTokenPriceChangedEvent[]> => {
  const notifications: NotificationTypes.PrimaryTokenPriceChangedEvent[] = []
  const storage = buildProcessedNotificationsStorage(appStorage.join(storageKey))
  const date = new Date()
  const dateString = date.toDateString()

  if (await storage.includes(dateString)) {
    return []
  }

  const response = await fetchPtPriceActivity([Date.now(), Date.now() - time.oneDay])
  const currency = await getCurrencySymbol(appStorage)
  const notificationsConfig = await notificationManager.config.read()
  const primaryTokenChangeNotificationConfig = notificationsConfig[NotificationTypes.Trigger.PrimaryTokenPriceChanged]

  if (isRight(response)) {
    const tickers = response.value.data.tickers
    const close = tickers[0]?.prices[currency] ?? 1
    const open = tickers[1]?.prices[currency] ?? 1
    const changeInPercent = (Math.abs(close - open) / open) * 100

    if (changeInPercent >= primaryTokenChangeNotificationConfig.thresholdInPercent) {
      const event = createPrimaryTokenPriceChangedNotification({previousPrice: open, nextPrice: close})
      notifications.push(event)
      await storage.addValues([dateString])
    }
  }

  return notifications
}

export const primaryTokenPriceChangedSubject = new Subject<NotificationTypes.PrimaryTokenPriceChangedEvent>()

export const usePrimaryTokenPriceChangedNotification = ({enabled}: {enabled: boolean}) => {
  const {walletManager} = useWalletManager()
  const asyncStorage = useAsyncStorage()

  React.useEffect(() => {
    if (!enabled) return

    const interval = setInterval(async () => {
      const notifications = await buildNotifications(asyncStorage)
      notifications.forEach((notification) => primaryTokenPriceChangedSubject.next(notification))
    }, refetchIntervalInMilliseconds)

    return () => clearInterval(interval)
  }, [walletManager, asyncStorage, enabled])
}

const createPrimaryTokenPriceChangedNotification = (
  metadata: NotificationTypes.PrimaryTokenPriceChangedEvent['metadata'],
): NotificationTypes.PrimaryTokenPriceChangedEvent => {
  return {
    trigger: NotificationTypes.Trigger.PrimaryTokenPriceChanged,
    id: generateNotificationId(),
    date: new Date().toISOString(),
    isRead: false,
    metadata,
  } as const
}
