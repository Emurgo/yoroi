import {mountAsyncStorage} from '@yoroi/common'
import {notificationManagerMaker} from '@yoroi/notifications'
import {displayNotificationEvent} from './notifications'
import {Notifications} from '@yoroi/types'
import {transactionReceivedSubject} from './transaction-received-notification'

const appStorage = mountAsyncStorage({path: '/'})

export const notificationManager = notificationManagerMaker({
  eventsStorage: appStorage.join('events/'),
  configStorage: appStorage.join('settings/'),
  display: displayNotificationEvent,
  subscriptions: {
    [Notifications.Trigger.TransactionReceived]: transactionReceivedSubject,
  },
})
