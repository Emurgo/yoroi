import {isRight, useAsyncStorage} from '@yoroi/common'
import {mountAsyncStorage} from '@yoroi/common/src'
import {App, Notifications as NotificationTypes} from '@yoroi/types'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import * as React from 'react'
import {Subject} from 'rxjs'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {generateNotificationId} from './notifications'
import {time} from '../../../../kernel/constants'
import {fetchPtPriceActivity} from '../../../../yoroi-wallets/cardano/usePrimaryTokenActivity'
import {getCurrencySymbol} from '../../../Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {notificationManager} from './notification-manager'

const BACKGROUND_FETCH_TASK = 'yoroi-primary-token-price-updated-background-fetch'

// Check is needed for hot reloading, as task can not be defined twice
if (!TaskManager.isTaskDefined(BACKGROUND_FETCH_TASK)) {
  const appStorage = mountAsyncStorage({path: '/'})
  TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    const notifications = await buildNotifications(appStorage)
    const hasNewData = notifications.length > 0
    notifications.forEach((notification) => notificationManager.events.push(notification))
    return hasNewData ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData
  })
}

const registerBackgroundFetchAsync = () => {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 10,
    stopOnTerminate: false,
    startOnBoot: true,
  })
}

const unregisterBackgroundFetchAsync = () => {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK)
}

const buildNotifications = async (
  appStorage: App.Storage,
): Promise<NotificationTypes.PrimaryTokenPriceChangedEvent[]> => {
  const notifications: NotificationTypes.PrimaryTokenPriceChangedEvent[] = []
  const storage = buildStorage(appStorage)
  const date = new Date()
  const dateString = date.toDateString()

  console.log('building notifications', dateString, await storage.getValues())
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

    if (changeInPercent >= primaryTokenChangeNotificationConfig.thresholdInPercent || changeInPercent > 0) {
      // TODO: Remove or true
      const event = createPrimaryTokenPriceUpdatedNotification({previousPrice: open, nextPrice: close})
      notifications.push(event)
      await storage.addValues([dateString])
    }
  }

  return notifications
}

export const createPrimaryTokenPriceUpdatedNotification = (
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

export const primaryTokenPriceChangedSubject = new Subject<NotificationTypes.PrimaryTokenPriceChangedEvent>()

export const usePrimaryTokenPriceChangedNotification = ({enabled}: {enabled: boolean}) => {
  const {walletManager} = useWalletManager()
  const asyncStorage = useAsyncStorage()

  React.useEffect(() => {
    if (!enabled) return
    registerBackgroundFetchAsync()
    return () => {
      unregisterBackgroundFetchAsync()
    }
  }, [enabled])

  React.useEffect(() => {
    if (!enabled) return
    const interval = setInterval(async () => {
      const notifications = await buildNotifications(asyncStorage)
      notifications.forEach((notification) => primaryTokenPriceChangedSubject.next(notification))
    }, 5 * 1000) // todo: change to 10 minutes

    return () => {
      clearInterval(interval)
    }
  }, [walletManager, asyncStorage, enabled])
}

const buildStorage = (appStorage: App.Storage) => {
  const storage = appStorage.join(`notifications/primary-token-price-changed-notification-history/`)

  const getValues = async () => {
    return (await storage.getItem<string[]>('processed')) || []
  }

  const addValues = async (values: string[]) => {
    const processed = await getValues()
    const newProcessed = [...processed, ...values]
    await storage.setItem('processed', newProcessed)
  }

  const includes = async (value: string) => {
    const processed = await getValues()
    return processed.includes(value)
  }

  const clear = async () => {
    await storage.setItem('processed', [])
  }

  return {
    getValues,
    addValues,
    includes,
    clear,
  }
}
