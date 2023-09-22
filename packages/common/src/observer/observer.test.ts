import {Observer, observerMaker} from './observer'

describe('Observer', () => {
  let observer: Observer<number>
  let mockSubscriber1: jest.Mock
  let mockSubscriber2: jest.Mock

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
    observer.subscribe(mockSubscriber1)
    observer.subscribe(mockSubscriber2)
    observer.notify(42)
    expect(mockSubscriber1).toHaveBeenCalledWith(42)
    expect(mockSubscriber2).toHaveBeenCalledWith(42)
  })

  it('should allow subscribers to unsubscribe', () => {
    observer.subscribe(mockSubscriber1)
    observer.unsubscribe(mockSubscriber1)
    observer.notify(42)
    expect(mockSubscriber1).not.toHaveBeenCalled()
    const unsubscribe = observer.subscribe(mockSubscriber1)
    unsubscribe()
    observer.notify(42)
    expect(mockSubscriber1).not.toHaveBeenCalled()
  })

  it('should allow destroying all subscriptions', () => {
    observer.subscribe(mockSubscriber1)
    observer.subscribe(mockSubscriber2)
    observer.destroy()
    observer.notify(42)
    expect(mockSubscriber1).not.toHaveBeenCalled()
    expect(mockSubscriber2).not.toHaveBeenCalled()
  })
})
