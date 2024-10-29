import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import * as React from 'react'
import {mountAsyncStorage, useAsyncStorage} from '@yoroi/common'
import {walletManager} from '../../../WalletManager/wallet-manager'
import {notificationManager} from './notification-manager'
import {Notifications as NotificationTypes} from '@yoroi/types'
import {generateNotificationId} from './notifications'
import {Subject} from 'rxjs'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'

const backgroundTaskId = 'yoroi-rewards-updated-notifications-background-fetch'
const backgroundSyncInMinutes = 60 * 10

// Check is needed for hot reloading, as task can not be defined twice
if (!TaskManager.isTaskDefined(backgroundTaskId)) {
  const appStorage = mountAsyncStorage({path: '/'})
  TaskManager.defineTask(backgroundTaskId, async () => {
    await syncAllWallets()
    const notifications = await buildNotifications(appStorage)
    notifications.forEach((notification) => notificationManager.events.push(notification))
    const hasNewData = notifications.length > 0
    return hasNewData ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData
  })
}

export const rewardsUpdatedSubject = new Subject<NotificationTypes.RewardsUpdatedEvent>()

const registerBackgroundFetchAsync = () => {
  return BackgroundFetch.registerTaskAsync(backgroundTaskId, {
    minimumInterval: backgroundSyncInMinutes,
    stopOnTerminate: false,
    startOnBoot: true,
  })
}

const unregisterBackgroundFetchAsync = () => {
  return BackgroundFetch.unregisterTaskAsync(backgroundTaskId)
}

const syncAllWallets = async () => {
  const ids = [...walletManager.walletMetas.keys()]
  for (const id of ids) {
    const wallet = walletManager.getWalletById(id)
    if (!wallet) continue
    await wallet.sync({})
  }
}

const createRewardsUpdatedNotification = () => {
  return {
    id: generateNotificationId(),
    date: new Date().toISOString(),
    isRead: false,
    trigger: NotificationTypes.Trigger.RewardsUpdated,
  } as const
}

export const useRewardsUpdatedNotifications = ({enabled}: {enabled: boolean}) => {
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
    const subscription = walletManager.syncWalletInfos$.subscribe(async (status) => {
      const walletInfos = Array.from(status.values())
      const walletsDoneSyncing = walletInfos.filter((info) => info.status === 'done')
      const areAllDone = walletsDoneSyncing.length === walletInfos.length
      if (!areAllDone) return

      const notifications = await buildNotifications(asyncStorage)
      notifications.forEach((notification) => rewardsUpdatedSubject.next(notification))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [walletManager, asyncStorage, enabled])
}
