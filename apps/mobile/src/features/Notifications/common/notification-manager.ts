import {notificationManagerMaker} from '@yoroi/notifications'
import {Notifications} from '@yoroi/types'
import * as React from 'react'

import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {bannerTriggersSubject} from './banners'
import {primaryTokenPriceChangedSubject} from './primary-token-price-changed-notification'
import {rewardsUpdatedSubject} from './rewards-updated-notification'
import {configStorage, eventsStorage} from './storage'
import {transactionReceivedSubject} from './transaction-received-notification'

export const pushNotificationsManager = notificationManagerMaker({
  eventsStorage,
  configStorage,
})

export const useNotificationManagerMaker = () => {
  const cleanupRef = React.useRef<Notifications.Manager | null>(null)
  const walletManger = useWalletManager()
  const walletId = walletManger.selected.wallet?.id ?? ''
  return React.useMemo(() => {
    cleanupRef.current?.destroy()
    const manager = notificationManagerMaker({
      eventsStorage: eventsStorage.join(`${walletId}/`),
      configStorage: configStorage.join(`${walletId}/`),
      subscriptions: {
        [Notifications.Trigger.TransactionReceived]: transactionReceivedSubject,
        [Notifications.Trigger.PrimaryTokenPriceChanged]:
          primaryTokenPriceChangedSubject,
        [Notifications.Trigger.RewardsUpdated]: rewardsUpdatedSubject,
        [Notifications.Trigger.Banner]: bannerTriggersSubject,
      },
    })
    cleanupRef.current = manager
    return manager
  }, [walletId])
}
