import {App} from '@yoroi/types'

import {observerMaker} from './observer'

describe('Observer', () => {
  let observer: App.ObserverManager<number>
  let mockSubscriber1: App.Subscriber<number>
  let mockSubscriber2: App.Subscriber<number>

  beforeEach(() => {
    observer = observerMaker<number>()
    mockSubscriber1 = jest.fn()
    mockSubscriber2 = jest.fn()
  })

  it('should allow subscribers to subscribe', () => {
    observer.subscribe(mockSubscriber1)
    observer.notify(42)
    expect(mockSubscriber1).toHaveBeenCalledWith(42)
  })

  it('should allow multiple subscribers to subscribe', () => {
    const client1 = observer.subscribe(mockSubscriber1)
    const client2 = observer.subscribe(mockSubscriber2)
    observer.notify(42)
    expect(mockSubscriber1).toHaveBeenCalledWith(42)
    expect(mockSubscriber2).toHaveBeenCalledWith(42)
    client1.unsubscribe()
    client2.unsubscribe()
  })

  it('should allow subscribers to unsubscribe', () => {
    const client1 = observer.subscribe(mockSubscriber1)
    client1.unsubscribe()
    observer.notify(42)
    expect(mockSubscriber1).not.toHaveBeenCalled()
  })

  it('should allow destroying all subscriptions', () => {
    const client1 = observer.subscribe(mockSubscriber1)
    observer.subscribe(mockSubscriber2)
    observer.unsubscribe(client1)
    observer.notify(42)
    expect(mockSubscriber2).toHaveBeenCalledWith(42)
    expect(mockSubscriber1).not.toHaveBeenCalled()
    observer.destroy()
    observer.notify(42)
    expect(mockSubscriber1).not.toHaveBeenCalled()
    expect(mockSubscriber2).toHaveBeenCalledTimes(1)
  })
})
