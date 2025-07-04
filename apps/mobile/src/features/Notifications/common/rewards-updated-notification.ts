import {useAsyncStorage} from '@yoroi/common'
import {App, Notifications as NotificationTypes} from '@yoroi/types'
import * as React from 'react'
import {Subject} from 'rxjs'

import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {walletManager} from '../../WalletManager/wallet-manager'
import {generateNotificationId} from './notifications'
import {buildProcessedNotificationsStorage} from './processed-notifications-storage'

const storageKey = 'rewards-updated-notification-history'

export const rewardsUpdatedSubject =
  new Subject<NotificationTypes.RewardsUpdatedEvent>()

const buildNotifications = async (appStorage: App.Storage) => {
  const walletIds = [...walletManager.walletMetas.keys()]
  const notifications: NotificationTypes.RewardsUpdatedEvent[] = []

  for (const walletId of walletIds) {
    const wallet = walletManager.getWalletById(walletId)
    if (!wallet) continue

    const fullStorageKey =
      `wallet/${walletId}/${wallet.networkManager.network}/${storageKey}/` as const
    const storage = buildProcessedNotificationsStorage(
      appStorage.join(fullStorageKey),
    )
    const stakingInfo = await wallet.getStakingInfo()
    if (stakingInfo.status !== 'staked') continue

    const {rewards} = stakingInfo

    if (await storage.isEmpty()) {
      await storage.setValues([rewards])
    }

    const [latestReward] = await storage.getValues()

    if (latestReward === rewards) continue

    await storage.setValues([rewards])
    notifications.push(createRewardsUpdatedNotification(walletId))
  }

  return notifications
}

const createRewardsUpdatedNotification = (
  walletId: string,
): NotificationTypes.RewardsUpdatedEvent => {
  return {
    id: generateNotificationId(),
    date: new Date().toISOString(),
    isRead: false,
    trigger: NotificationTypes.Trigger.RewardsUpdated,
    metadata: {
      walletId,
    },
  } as const
}

export const useRewardsUpdatedNotifications = ({
  enabled,
}: {
  enabled: boolean
}) => {
  const {walletManager, selected} = useWalletManager()
  const asyncStorage = useAsyncStorage()
  const [subscriptionBeginTime] = React.useState(new Date())
  const wallet = selected.wallet

  React.useEffect(() => {
    if (!enabled || !wallet) return

    const subscription = walletManager.syncWalletInfos$.subscribe(
      async (status) => {
        const info = wallet.networkManager.epoch.info(new Date())
        if (info.start.getTime() <= subscriptionBeginTime.getTime()) return

        const walletInfos = Array.from(status.values())
        const walletsDoneSyncing = walletInfos.filter(
          (info) => info.status === 'done',
        )
        const areAllDone = walletsDoneSyncing.length === walletInfos.length
        if (!areAllDone) return

        const notifications = await buildNotifications(asyncStorage)
        notifications.forEach((notification) =>
          rewardsUpdatedSubject.next(notification),
        )
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [walletManager, asyncStorage, enabled, wallet, subscriptionBeginTime])
}
