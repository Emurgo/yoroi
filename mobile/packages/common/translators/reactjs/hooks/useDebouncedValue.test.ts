import {act, renderHook} from '@testing-library/react'

import {useDebouncedValue} from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const {result} = renderHook(() => useDebouncedValue('initial', 1000))

    expect(result.current).toBe('initial')
  })

  it('should debounce value updates', () => {
    const {result, rerender} = renderHook(
      ({value}) => useDebouncedValue(value, 1000),
      {initialProps: {value: 'initial'}},
    )

    expect(result.current).toBe('initial')

    rerender({value: 'updated'})

    expect(result.current).toBe('initial')

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current).toBe('updated')
  })

  it('should cancel previous update on rapid changes', () => {
    const {result, rerender} = renderHook(
      ({value}) => useDebouncedValue(value, 1000),
      {initialProps: {value: 'value1'}},
    )

    rerender({value: 'value2'})

    act(() => {
      jest.advanceTimersByTime(500)
    })

    rerender({value: 'value3'})

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current).toBe('value3')
  })

  it('should use default delay when not provided', () => {
    const {result, rerender} = renderHook(
      ({value}) => useDebouncedValue(value),
      {initialProps: {value: 'initial'}},
    )

    rerender({value: 'updated'})

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })
})
