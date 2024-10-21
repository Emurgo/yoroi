import {mountAsyncStorage} from '@yoroi/common'
import {notificationManagerMaker} from '@yoroi/notifications'
import {Notifications} from '@yoroi/types'

import {displayNotificationEvent} from './notifications'
import {transactionReceivedSubject} from './transaction-received-notification'

const appStorage = mountAsyncStorage({path: '/'})
const notificationStorage = appStorage.join('notifications/')

export const notificationManager = notificationManagerMaker({
  eventsStorage: notificationStorage.join('events/'),
  configStorage: notificationStorage.join('settings/'),
  display: displayNotificationEvent,
  subscriptions: {
    [Notifications.Trigger.TransactionReceived]: transactionReceivedSubject,
  },
})
