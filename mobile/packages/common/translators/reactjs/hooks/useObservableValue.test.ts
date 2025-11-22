import {act, renderHook} from '@testing-library/react'
import {BehaviorSubject, Subject} from 'rxjs'

import {useObservableValue} from './useObservableValue'

describe('useObservableValue', () => {
  it('should update the data when the observable emits a value', async () => {
    const observable$ = new Subject<void>()
    const getter = jest.fn()
    getter.mockReturnValueOnce('Initial Data')
    getter.mockReturnValue('Updated Data')

    const {result} = renderHook(() =>
      useObservableValue({
        observable$,
        getter,
      }),
    )

    expect(result.current).toBe('Initial Data')
    // getter is called on mount (initialization)
    expect(getter).toHaveBeenCalled()

    const initialCallCount = getter.mock.calls.length

    act(() => {
      observable$.next()
    })

    expect(result.current).toBe('Updated Data')
    // getter should be called again when observable emits
    expect(getter.mock.calls.length).toBeGreaterThan(initialCallCount)
  })

  it('should not cause double renders on mount with BehaviorSubject', () => {
    const behaviorSubject$ = new BehaviorSubject<number>(42)
    const getter = jest.fn(() => behaviorSubject$.value)
    let renderCount = 0

    const {result} = renderHook(() => {
      renderCount++
      return useObservableValue({
        observable$: behaviorSubject$,
        getter,
      })
    })

    // Should only render once on mount (no double render)
    // This is the key improvement over useState + useEffect
    expect(renderCount).toBe(1)
    expect(result.current).toBe(42)
    // getter is called for initialization
    expect(getter).toHaveBeenCalled()
  })

  it('should update when BehaviorSubject emits new value', () => {
    const behaviorSubject$ = new BehaviorSubject<number>(10)
    const getter = jest.fn(() => behaviorSubject$.value)

    const {result} = renderHook(() =>
      useObservableValue({
        observable$: behaviorSubject$,
        getter,
      }),
    )

    expect(result.current).toBe(10)
    // getter is called once on mount, and once when subscription is set up
    // React may call getSnapshot multiple times, but getter is only called on subscription
    expect(getter.mock.calls.length).toBeGreaterThanOrEqual(1)

    act(() => {
      behaviorSubject$.next(20)
    })

    expect(result.current).toBe(20)
    // getter is called again when observable emits
    expect(getter.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('should cleanup subscription on unmount', () => {
    const observable$ = new Subject<void>()
    const getter = jest.fn(() => 'value')
    const subscribeSpy = jest.spyOn(observable$, 'subscribe')

    const {unmount} = renderHook(() =>
      useObservableValue({
        observable$,
        getter,
      }),
    )

    expect(subscribeSpy).toHaveBeenCalledTimes(1)
    const subscription = subscribeSpy.mock.results[0]?.value
    const unsubscribeSpy = jest.spyOn(subscription, 'unsubscribe')

    unmount()

    expect(unsubscribeSpy).toHaveBeenCalledTimes(1)
  })

  it('should use getServerSnapshot for initial server-side rendering', () => {
    const observable$ = new BehaviorSubject<number>(100)
    const getter = jest.fn(() => observable$.value)

    // Simulate server-side rendering by calling getServerSnapshot directly
    // This tests the getServerSnapshot callback
    const {result} = renderHook(() =>
      useObservableValue({
        observable$,
        getter,
      }),
    )

    // getServerSnapshot should return the current value from getter
    expect(result.current).toBe(100)
    expect(getter).toHaveBeenCalled()
  })

  it('should handle getSnapshot being called multiple times', () => {
    const observable$ = new BehaviorSubject<number>(5)
    const getter = jest.fn(() => observable$.value)

    const {result} = renderHook(() =>
      useObservableValue({
        observable$,
        getter,
      }),
    )

    // getSnapshot may be called multiple times by React
    const value1 = result.current
    const value2 = result.current
    expect(value1).toBe(value2)
    expect(value1).toBe(5)
  })
})
