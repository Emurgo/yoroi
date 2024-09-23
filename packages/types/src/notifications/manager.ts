import {BehaviorSubject, Subject} from 'rxjs'
import {AppStorage} from '../app/storage'

export enum NotificationTrigger {
  'TransactionReceived' = 'TransactionReceived',
  'RewardsUpdated' = 'RewardsUpdated',
  'PrimaryTokenPriceChanged' = 'PrimaryTokenPriceChanged',
}

export type NotificationManagerMakerProps = {
  eventsStorage: AppStorage<true, string>
  configStorage: AppStorage<true, string>
  subscriptions?: Partial<
    Record<NotificationTrigger, Subject<NotificationEvent>>
  >
}

export interface NotificationTransactionReceivedEvent
  extends NotificationEventBase {
  trigger: NotificationTrigger.TransactionReceived
  metadata: {
    previousTxsCounter: number
    nextTxsCounter: number
    txId: string
    isSentByUser: boolean // check local pending
  }
}

export interface NotificationRewardsUpdatedEvent extends NotificationEventBase {
  trigger: NotificationTrigger.RewardsUpdated
}

export interface NotificationPrimaryTokenPriceChangedEvent
  extends NotificationEventBase {
  trigger: NotificationTrigger.PrimaryTokenPriceChanged
  metadata: {
    previousPrice: number
    nextPrice: number
  }
}

export type NotificationGroup = 'transaction-history' | 'portfolio'

export type NotificationEvent = NotificationTransactionReceivedEvent

type NotificationEventId = string

interface NotificationEventBase {
  id: string // uuid
  date: string
  isRead: boolean
}

export type NotificationConfig = {
  [NotificationTrigger.PrimaryTokenPriceChanged]: {
    notify: boolean
    thresholdInPercent: number
    interval: '24h' | '1h'
  }
  [NotificationTrigger.TransactionReceived]: {
    notify: boolean
  }
  [NotificationTrigger.RewardsUpdated]: {
    notify: boolean
  }
}

export type NotificationManager = {
  hydrate: () => void // build up subscriptions

  unreadCounterByGroup$: BehaviorSubject<
    Readonly<Map<NotificationGroup, number>>
  >
  notification$: Subject<NotificationEvent>

  // Events represent a notification event that was trigger by a config rule
  events: {
    markAllAsRead: () => Promise<void>
    markAsRead(id: NotificationEventId): Promise<void>
    read: () => Promise<ReadonlyArray<NotificationEvent>>
    save: (event: Readonly<NotificationEvent>) => Promise<void>
    clear: () => Promise<void>
  }
  // Config sets the ground to what, when, and if should notify user
  config: {
    read: () => Promise<Readonly<NotificationConfig>> // return initial if empty
    save: (config: Readonly<NotificationConfig>) => Promise<void>
    reset: () => Promise<void>
  }

  destroy: () => Promise<void> // tear down subscriptions
  clear: () => Promise<void>
}
