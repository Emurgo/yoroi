import {act, renderHook} from '@testing-library/react'
import {Subject} from 'rxjs'

import {useObservableSelector} from './useObservableSelector'

describe('useObservableSelector', () => {
  it('should return selected value from selector', () => {
    const observable$ = new Subject<void>()
    const source = {value: 'initial'}
    const selector = jest.fn(() => source.value)

    const {result} = renderHook(() =>
      useObservableSelector(observable$, selector),
    )

    expect(result.current).toBe('initial')
    expect(selector).toHaveBeenCalled()
  })

  it('should update when observable emits', () => {
    const observable$ = new Subject<void>()
    const source = {value: 'initial'}
    const selector = jest.fn(() => source.value)

    const {result} = renderHook(() =>
      useObservableSelector(observable$, selector),
    )

    source.value = 'updated'

    act(() => {
      observable$.next()
    })

    expect(result.current).toBe('updated')
  })

  it('should call selector on each update', () => {
    const observable$ = new Subject<void>()
    const source = {value: 1}
    const selector = jest.fn(() => source.value)

    renderHook(() => useObservableSelector(observable$, selector))

    const initialCallCount = selector.mock.calls.length

    act(() => {
      observable$.next()
    })

    expect(selector.mock.calls.length).toBeGreaterThan(initialCallCount)
  })

  it('should cleanup subscription on unmount', () => {
    const observable$ = new Subject<void>()
    const selector = jest.fn(() => 'value')
    const subscribeSpy = jest.spyOn(observable$, 'subscribe')

    const {unmount} = renderHook(() =>
      useObservableSelector(observable$, selector),
    )

    expect(subscribeSpy).toHaveBeenCalled()
    const subscription = subscribeSpy.mock.results[0]?.value
    const unsubscribeSpy = jest.spyOn(subscription, 'unsubscribe')

    unmount()

    expect(unsubscribeSpy).toHaveBeenCalled()
  })
})
