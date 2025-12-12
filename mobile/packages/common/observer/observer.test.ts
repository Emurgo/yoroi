import {observerMaker} from './observer'

describe('observerMaker', () => {
  it('should create observer manager', () => {
    const manager = observerMaker<string>()
    expect(manager.subscribe).toBeDefined()
    expect(manager.unsubscribe).toBeDefined()
    expect(manager.notify).toBeDefined()
    expect(manager.destroy).toBeDefined()
    expect(manager.observable).toBeDefined()
  })

  it('should subscribe and notify observers', () => {
    const manager = observerMaker<string>()
    const observer = jest.fn()

    const subscription = manager.subscribe(observer)
    manager.notify('test')

    expect(observer).toHaveBeenCalledWith('test')
    manager.unsubscribe(subscription)
  })

  it('should handle multiple subscribers', () => {
    const manager = observerMaker<number>()
    const observer1 = jest.fn()
    const observer2 = jest.fn()

    const sub1 = manager.subscribe(observer1)
    const sub2 = manager.subscribe(observer2)

    manager.notify(42)

    expect(observer1).toHaveBeenCalledWith(42)
    expect(observer2).toHaveBeenCalledWith(42)

    manager.unsubscribe(sub1)
    manager.unsubscribe(sub2)
  })

  it('should destroy observer', () => {
    const manager = observerMaker<string>()
    const observer = jest.fn()

    manager.subscribe(observer)
    manager.destroy()
    manager.notify('test')

    expect(observer).not.toHaveBeenCalled()
  })
})
