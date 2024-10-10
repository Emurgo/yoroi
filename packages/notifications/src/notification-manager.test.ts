import {notificationManagerMaker} from './notification-manager'
import {mountAsyncStorage} from '@yoroi/common/src'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {BehaviorSubject, Subject} from 'rxjs'
import {Notifications} from '@yoroi/types'

const createManager = () => {
  const eventsStorage = mountAsyncStorage({path: 'events/'})
  const configStorage = mountAsyncStorage({path: 'config/'})
  return notificationManagerMaker({
    eventsStorage,
    configStorage,
    display: jest.fn(),
  })
}

describe('NotificationManager', () => {
  beforeEach(() => AsyncStorage.clear())

  it('should be defined', () => {
    const manager = createManager()
    expect(manager).toBeDefined()
  })

  it('should return default config if not set', async () => {
    const manager = createManager()

    const config = await manager.config.read()
    expect(config).toEqual({
      [Notifications.Trigger.PrimaryTokenPriceChanged]: {
        interval: '24h',
        notify: true,
        thresholdInPercent: 10,
      },
      [Notifications.Trigger.TransactionReceived]: {
        notify: true,
      },
      [Notifications.Trigger.RewardsUpdated]: {
        notify: true,
      },
    })
  })

  it('should allow to save config', async () => {
    const manager = createManager()

    const config = await manager.config.read()
    const newConfig = {
      ...config,
      [Notifications.Trigger.TransactionReceived]: {
        notify: false,
      },
    }

    await manager.config.save(newConfig)
    const savedConfig = await manager.config.read()
    expect(savedConfig).toEqual(newConfig)
  })

  it('should allow to reset config', async () => {
    const manager = createManager()

    const config = await manager.config.read()
    const newConfig = {
      ...config,
      [Notifications.Trigger.TransactionReceived]: {
        notify: false,
      },
    }

    await manager.config.save(newConfig)
    await manager.config.reset()
    const savedConfig = await manager.config.read()
    expect(savedConfig).toEqual(config)
  })

  it('should default unread counter with 0 for all event types', async () => {
    const manager = createManager()

    expect(manager.unreadCounterByGroup$.value).toEqual(
      new Map([
        ['transaction-history', 0],
        ['portfolio', 0],
      ]),
    )
  })

  it('should allow to save events', async () => {
    const manager = createManager()

    const event = createTransactionReceivedEvent()
    await manager.events.push(event)
    const savedEvents = await manager.events.read()
    expect(savedEvents).toEqual([event])
    expect(
      manager.unreadCounterByGroup$.value.get('transaction-history'),
    ).toEqual(1)
  })

  it('should allow to save events that are read', async () => {
    const manager = createManager()

    const event = createTransactionReceivedEvent({isRead: true})
    await manager.events.push(event)
    const savedEvents = await manager.events.read()
    expect(savedEvents).toEqual([event])
    expect(
      manager.unreadCounterByGroup$.value.get('transaction-history'),
    ).toEqual(0)
  })

  it('should allow to mark 1 event as read', async () => {
    const manager = createManager()

    const event1 = createTransactionReceivedEvent()
    const event2 = createTransactionReceivedEvent()
    const event3 = createTransactionReceivedEvent()
    await manager.events.push(event1)
    await manager.events.push(event2)
    await manager.events.push(event3)

    expect(
      manager.unreadCounterByGroup$.value.get('transaction-history'),
    ).toEqual(3)
    await manager.events.markAsRead(event2.id)
    const savedEvents = await manager.events.read()
    expect(findEvent([...savedEvents], event2.id)?.isRead).toBeTruthy()
    expect(
      manager.unreadCounterByGroup$.value.get('transaction-history'),
    ).toEqual(2)
  })

  it('should allow to mark all events as read', async () => {
    const manager = createManager()

    const event1 = createTransactionReceivedEvent()
    const event2 = createTransactionReceivedEvent()
    const event3 = createTransactionReceivedEvent()
    await manager.events.push(event1)
    await manager.events.push(event2)
    await manager.events.push(event3)

    await manager.events.markAllAsRead()
    const savedEvents = await manager.events.read()
    expect(savedEvents.every((event) => event.isRead)).toBeTruthy()
    expect(
      manager.unreadCounterByGroup$.value.get('transaction-history'),
    ).toEqual(0)
  })

  it('should allow to clear events', async () => {
    const manager = createManager()

    const event1 = createTransactionReceivedEvent()
    const event2 = createTransactionReceivedEvent()
    const event3 = createTransactionReceivedEvent()
    await manager.events.push(event1)
    await manager.events.push(event2)
    await manager.events.push(event3)

    await manager.events.clear()
    const savedEvents = await manager.events.read()
    expect(savedEvents).toEqual([])
    expect(
      manager.unreadCounterByGroup$.value.get('transaction-history'),
    ).toEqual(0)
  })

  it('should allow to clear all events and reset config', async () => {
    const manager = createManager()

    const event1 = createTransactionReceivedEvent()
    const event2 = createTransactionReceivedEvent()
    const event3 = createTransactionReceivedEvent()
    await manager.events.push(event1)
    await manager.events.push(event2)
    await manager.events.push(event3)

    const config = await manager.config.read()
    const newConfig = {
      ...config,
      [Notifications.Trigger.TransactionReceived]: {
        notify: false,
      },
    }
    await manager.config.save(newConfig)

    await manager.clear()
    const savedEvents = await manager.events.read()
    const savedConfig = await manager.config.read()
    expect(savedEvents).toEqual([])
    expect(savedConfig).toEqual(config)
    expect(
      manager.unreadCounterByGroup$.value.get('transaction-history'),
    ).toEqual(0)
  })

  it('should allow to destroy manager', async () => {
    const manager = createManager()
    await manager.destroy()
    expect(manager.unreadCounterByGroup$.isStopped).toBeTruthy()
  })

  it('should notify user if config is set to true', async () => {
    const manager = createManager()
    const event = createTransactionReceivedEvent()
    const config = await manager.config.read()
    const newConfig = {
      ...config,
      [Notifications.Trigger.TransactionReceived]: {
        notify: true,
      },
    }
    await manager.config.save(newConfig)
    await manager.events.push(event)
    const savedEvents = await manager.events.read()
    expect(savedEvents).toEqual([event])
    expect(
      manager.unreadCounterByGroup$.value.get('transaction-history'),
    ).toEqual(1)
  })

  it('should not notify user if config is set to false', async () => {
    const manager = createManager()
    const event = createTransactionReceivedEvent()
    const config = await manager.config.read()
    const newConfig = {
      ...config,
      [Notifications.Trigger.TransactionReceived]: {
        notify: false,
      },
    }
    await manager.config.save(newConfig)
    await manager.events.push(event)
    const savedEvents = await manager.events.read()
    expect(savedEvents).toEqual([])
    expect(
      manager.unreadCounterByGroup$.value.get('transaction-history'),
    ).toEqual(0)
  })

  it('should subscribe to events when called hydrate', async () => {
    const eventsStorage = mountAsyncStorage({path: 'events/'})
    const configStorage = mountAsyncStorage({path: 'config/'})

    const event = createTransactionReceivedEvent()

    const notificationSubscription = new BehaviorSubject(event)

    const manager = notificationManagerMaker({
      eventsStorage,
      configStorage,
      subscriptions: {
        [Notifications.Trigger.TransactionReceived]: notificationSubscription,
        [Notifications.Trigger.RewardsUpdated]: new Subject(),
        [Notifications.Trigger.PrimaryTokenPriceChanged]: new Subject(),
      },
      display: jest.fn(),
    })

    manager.hydrate()

    await new Promise((resolve) => setTimeout(resolve, 1000))
    const savedEventsAfter = await manager.events.read()
    expect(savedEventsAfter).toEqual([event])
    await manager.destroy()
  })

  it('should not crash when hydrating with no subscriptions', async () => {
    const manager = createManager()

    manager.hydrate()
    await manager.destroy()
  })
})

const createTransactionReceivedEvent = (
  overrides?: Partial<Notifications.TransactionReceivedEvent>,
): Notifications.TransactionReceivedEvent => ({
  id: Math.random() * 10000,
  trigger: Notifications.Trigger.TransactionReceived,
  date: new Date().toISOString(),
  isRead: false,
  metadata: {
    previousTxsCounter: 0,
    nextTxsCounter: 1,
    txId: '1',
    isSentByUser: true,
  },
  ...overrides,
})

const findEvent = (events: Notifications.Event[], id: number) => {
  return events.find((event) => event.id === id)
}
