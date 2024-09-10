import {BehaviorSubject} from 'rxjs'

export enum NotificationTrigger {
  'TransactionReceived' = 'TransactionReceived',
  'RewardsUpdated' = 'RewardsUpdated',
  'PrimaryTokenPriceChanged' = 'PrimaryTokenPriceChanged',
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

export type Group = 'transaction-history' | 'portfolio'

type NotificationTriggerPerGroup = {
  'transaction-history':
    | NotificationTrigger.TransactionReceived
    | NotificationTrigger.RewardsUpdated
  'portfolio': NotificationTrigger.PrimaryTokenPriceChanged
}

export type NotificationEvent = NotificationTransactionReceivedEvent

type NotificationEventId = string

interface NotificationEventBase {
  id: string // uuid
  date: number
  isRead: boolean
}

export type NotificationConfig = {
  [NotificationTrigger.PrimaryTokenPriceChanged]: {
    notify: boolean
    threshold: number
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
  unreadCounterByGroup$: BehaviorSubject<Readonly<Map<Group, number>>>

  // NOTE: events represent a notification event that was trigger by a config rule
  events: {
    markAllAsRead: () => void
    markAsRead(id: NotificationEventId): void
    read: () => Promise<ReadonlyArray<NotificationEvent>>
    save: (event: Readonly<NotificationEvent>) => void
    clear: () => void
  }
  // NOTE: config sets the ground to what, when, and if should notify user
  config: {
    read: () => Promise<Readonly<NotificationConfig>> // return initial if empty
    save: (config: Readonly<NotificationConfig>) => Promise<void>
    reset: () => Promise<void>
  }
  destroy: () => void // tear down subscriptions
  clear: () => void
}

// TODO: Add trackers - these are only pointers to last notification event
