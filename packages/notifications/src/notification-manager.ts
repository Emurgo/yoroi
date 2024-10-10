import {BehaviorSubject, Subject, Subscription} from 'rxjs'
import {App, Notifications} from '@yoroi/types'

type EventsStorageData = ReadonlyArray<Notifications.Event>
type ConfigStorageData = Notifications.Config

const getAllTriggers = (): Array<Notifications.Trigger> =>
  Object.values(Notifications.Trigger)

export const notificationManagerMaker = ({
  eventsStorage,
  configStorage,
  subscriptions,
  display,
}: Notifications.ManagerMakerProps): Notifications.Manager => {
  const localSubscriptions: Subscription[] = []

  const hydrate = () => {
    const triggers = getAllTriggers()
    triggers.forEach((trigger) => {
      const subscription = subscriptions?.[trigger]?.subscribe(
        (event: Notifications.Event) => events.push(event),
      )
      if (subscription) {
        localSubscriptions.push(subscription)
      }
    })
  }

  const config = configManagerMaker({storage: configStorage})
  const {events, unreadCounterByGroup$} = eventsManagerMaker({
    storage: eventsStorage,
    config,
    display,
  })

  const clear = async () => {
    await config.reset()
    await events.clear()
  }

  const destroy = async () => {
    unreadCounterByGroup$.complete()
    localSubscriptions.forEach((subscription) => subscription.unsubscribe())
  }

  return {
    hydrate,
    clear,
    destroy,
    events,
    config,
    unreadCounterByGroup$,
  }
}

const getNotificationGroup = (
  trigger: Notifications.Trigger,
): Notifications.Group => {
  return notificationTriggerGroups[trigger]
}

const notificationTriggerGroups: Record<
  Notifications.Trigger,
  Notifications.Group
> = {
  [Notifications.Trigger.TransactionReceived]: 'transaction-history',
  [Notifications.Trigger.RewardsUpdated]: 'portfolio',
  [Notifications.Trigger.PrimaryTokenPriceChanged]: 'portfolio',
}

const eventsManagerMaker = ({
  storage,
  config,
  display,
}: {
  display: (event: Notifications.Event) => void
  storage: App.Storage<true, string>
  config: Notifications.Manager['config']
}): {
  events: Notifications.Manager['events']
  unreadCounterByGroup$: BehaviorSubject<
    Readonly<Map<Notifications.Group, number>>
  >
} => {
  const unreadCounterByGroup$ = new BehaviorSubject<
    Map<Notifications.Group, number>
  >(buildUnreadCounterDefaultValue())

  const updateUnreadCounter = async () => {
    const allEvents = await events.read()
    const unreadCounterByGroup = buildUnreadCounterDefaultValue()
    const unreadEvents = allEvents.filter((event) => !event.isRead)
    unreadEvents.forEach((event) => {
      const group = getNotificationGroup(event.trigger)
      const previousCount = unreadCounterByGroup.get(group) || 0
      unreadCounterByGroup.set(group, previousCount + 1)
    })
    unreadCounterByGroup$.next(unreadCounterByGroup)
  }

  const events = {
    markAllAsRead: async () => {
      const allEvents = await events.read()
      const modifiedEvents = allEvents.map((event) => ({
        ...event,
        isRead: true,
      }))
      await storage.setItem<EventsStorageData>('events', modifiedEvents)
      unreadCounterByGroup$.next(buildUnreadCounterDefaultValue())
    },
    markAsRead: async (id: number) => {
      const allEvents = await events.read()
      const modifiedEvents = allEvents.map((event) =>
        event.id === id ? {...event, isRead: true} : event,
      )
      await storage.setItem<EventsStorageData>('events', modifiedEvents)
      await updateUnreadCounter()
    },
    read: async (): Promise<EventsStorageData> => {
      return (await storage.getItem<EventsStorageData>('events')) ?? []
    },
    push: async (event: Readonly<Notifications.Event>) => {
      if (!shouldNotify(event, await config.read())) {
        return
      }
      const allEvents = await events.read()
      await storage.setItem('events', [...allEvents, event])
      if (!event.isRead) {
        await updateUnreadCounter()
        display(event)
      }
    },
    clear: async (): Promise<void> => {
      await storage.removeItem('events')
      unreadCounterByGroup$.next(buildUnreadCounterDefaultValue())
    },
  }
  return {events, unreadCounterByGroup$}
}

const configManagerMaker = ({
  storage,
}: {
  storage: App.Storage<true, string>
}): Notifications.Manager['config'] => {
  return {
    read: async (): Promise<Notifications.Config> => {
      return (
        (await storage.getItem<ConfigStorageData>('config')) ?? defaultConfig
      )
    },
    save: async (config: Notifications.Config): Promise<void> => {
      await storage.setItem('config', config)
    },
    reset: async (): Promise<void> => {
      return storage.removeItem('config')
    },
  }
}

const shouldNotify = (
  event: Notifications.Event,
  config: Notifications.Config,
): boolean => {
  return config[event.trigger].notify
}

const buildUnreadCounterDefaultValue = (): Map<Notifications.Group, number> => {
  return new Map<Notifications.Group, number>(
    Object.values(notificationTriggerGroups).map((group) => [group, 0]),
  )
}

const defaultConfig: Notifications.Config = {
  [Notifications.Trigger.PrimaryTokenPriceChanged]: {
    notify: true,
    thresholdInPercent: 10,
    interval: '24h',
  },
  [Notifications.Trigger.TransactionReceived]: {
    notify: true,
  },
  [Notifications.Trigger.RewardsUpdated]: {
    notify: true,
  },
}
