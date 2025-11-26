import {act, renderHook} from '@testing-library/react'
import {BehaviorSubject} from 'rxjs'

import {useObservable} from './useObservable'

describe('useObservable', () => {
  it('should return current value from BehaviorSubject', () => {
    const subject$ = new BehaviorSubject<string>('initial')

    const {result} = renderHook(() => useObservable(subject$))

    expect(result.current).toBe('initial')
  })

  it('should update when BehaviorSubject emits new value', () => {
    const subject$ = new BehaviorSubject<number>(10)

    const {result} = renderHook(() => useObservable(subject$))

    expect(result.current).toBe(10)

    act(() => {
      subject$.next(20)
    })

    expect(result.current).toBe(20)
  })

  it('should handle multiple updates', () => {
    const subject$ = new BehaviorSubject<number>(1)

    const {result} = renderHook(() => useObservable(subject$))

    act(() => {
      subject$.next(2)
      subject$.next(3)
      subject$.next(4)
    })

    expect(result.current).toBe(4)
  })

  it('should cleanup subscription on unmount', () => {
    const subject$ = new BehaviorSubject<string>('test')
    const subscribeSpy = jest.spyOn(subject$, 'subscribe')

    const {unmount} = renderHook(() => useObservable(subject$))

    expect(subscribeSpy).toHaveBeenCalled()
    const subscription = subscribeSpy.mock.results[0]?.value
    const unsubscribeSpy = jest.spyOn(subscription, 'unsubscribe')

    unmount()

    expect(unsubscribeSpy).toHaveBeenCalled()
  })
})
