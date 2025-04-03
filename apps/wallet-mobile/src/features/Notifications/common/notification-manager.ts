import {mountAsyncStorage} from '@yoroi/common'
import {notificationManagerMaker} from '@yoroi/notifications'
import {Notifications} from '@yoroi/types'
import * as React from 'react'

import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {primaryTokenPriceChangedSubject} from './primary-token-price-changed-notification'
import {rewardsUpdatedSubject} from './rewards-updated-notification'
import {transactionReceivedSubject} from './transaction-received-notification'

const appStorage = mountAsyncStorage({path: '/'})
const notificationStorage = appStorage.join('notifications/')

export const pushNotificationsManager = notificationManagerMaker({
  eventsStorage: notificationStorage.join('events/'),
  configStorage: notificationStorage.join('settings/'),
})

export const useNotificationManagerMaker = () => {
  const walletManger = useWalletManager()
  const walletId = walletManger.selected.wallet?.id ?? ''
  return React.useMemo(
    () =>
      notificationManagerMaker({
        eventsStorage: notificationStorage.join('events/'),
        configStorage: notificationStorage.join(`settings/${walletId}/`),
        subscriptions: {
          [Notifications.Trigger.TransactionReceived]: transactionReceivedSubject,
          [Notifications.Trigger.PrimaryTokenPriceChanged]: primaryTokenPriceChangedSubject,
          [Notifications.Trigger.RewardsUpdated]: rewardsUpdatedSubject,
        },
      }),
    [walletId],
  )
}
