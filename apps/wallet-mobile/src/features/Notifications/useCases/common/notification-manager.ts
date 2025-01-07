import {mountAsyncStorage} from '@yoroi/common'
import {notificationManagerMaker} from '@yoroi/notifications'
import {Notifications} from '@yoroi/types'

import {primaryTokenPriceChangedSubject} from './primary-token-price-changed-notification'
import {rewardsUpdatedSubject} from './rewards-updated-notification'
import {transactionReceivedSubject} from './transaction-received-notification'

const appStorage = mountAsyncStorage({path: '/'})
const notificationStorage = appStorage.join('notifications/')

export const notificationManager = notificationManagerMaker({
  eventsStorage: notificationStorage.join('events/'),
  configStorage: notificationStorage.join('settings/'),
  subscriptions: {
    [Notifications.Trigger.TransactionReceived]: transactionReceivedSubject,
    [Notifications.Trigger.PrimaryTokenPriceChanged]: primaryTokenPriceChangedSubject,
    [Notifications.Trigger.RewardsUpdated]: rewardsUpdatedSubject,
  },
})
