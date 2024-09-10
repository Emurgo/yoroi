import {
  Group,
  NotificationConfig,
  NotificationEvent,
  NotificationManager,
  NotificationTrigger,
} from './index'
import {BehaviorSubject} from 'rxjs'
import {App} from '@yoroi/types'

type NotificationManagerMakerProps = {
  eventsStorage: App.Storage<true, string>
  configStorage: App.Storage<true, string>
}

type EventsStorageData = ReadonlyArray<NotificationEvent>
type ConfigStorageData = NotificationConfig

export const notificationManagerMaker = ({
  eventsStorage,
  configStorage,
}: NotificationManagerMakerProps): NotificationManager => {
  const hydrate = () => {}

  const events = eventsManagerMaker({storage: eventsStorage})
  const config = configManagerMaker({storage: configStorage})

  const destroy = () => {}

  const clear = async () => {
    await config.reset()
    await events.clear()
  }

  const unreadCounterByGroup$ = new BehaviorSubject<Map<Group, number>>(
    new Map<Group, number>(),
  )

  return {hydrate, clear, destroy, events, config, unreadCounterByGroup$}
}

const eventsManagerMaker = ({
  storage,
}: {
  storage: App.Storage<true, string>
}): NotificationManager['events'] => {
  const events = {
    markAllAsRead: async () => {
      const allEvents = await events.read()
      const modifiedEvents = allEvents.map((event) => ({
        ...event,
        isRead: true,
      }))
      await storage.setItem<EventsStorageData>('events', modifiedEvents)
    },
    markAsRead: async (id: string) => {
      const allEvents = await events.read()
      const modifiedEvents = allEvents.map((event) =>
        event.id === id ? {...event, isRead: true} : event,
      )
      await storage.setItem<EventsStorageData>('events', modifiedEvents)
    },
    read: async (): Promise<EventsStorageData> => {
      return (await storage.getItem<EventsStorageData>('events')) ?? []
    },
    save: async (event: Readonly<NotificationEvent>) => {
      const allEvents = await events.read()
      await storage.setItem('events', [...allEvents, event])
    },
    clear: (): Promise<void> => {
      return storage.removeItem('events')
    },
  }
  return events
}

const configManagerMaker = ({
  storage,
}: {
  storage: App.Storage<true, string>
}): NotificationManager['config'] => {
  return {
    read: async (): Promise<NotificationConfig> => {
      return (
        (await storage.getItem<ConfigStorageData>('config')) ?? defaultConfig
      )
    },
    save: async (config: NotificationConfig): Promise<void> => {
      await storage.setItem('config', config)
    },
    reset: async (): Promise<void> => {
      return storage.removeItem('config')
    },
  }
}

const defaultConfig: NotificationConfig = {
  [NotificationTrigger.PrimaryTokenPriceChanged]: {
    notify: true,
    threshold: 10,
    interval: '24h',
  },
  [NotificationTrigger.TransactionReceived]: {
    notify: true,
  },
  [NotificationTrigger.RewardsUpdated]: {
    notify: true,
  },
}
