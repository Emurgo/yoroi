import {act, renderHook} from '@testing-library/react'

import {useDebouncedCallback} from './useDebouncedCallback'

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should skip first render by default', () => {
    const callback = jest.fn()

    renderHook(() => {
      useDebouncedCallback(callback, 'value', 1000)
    })

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('should call callback after delay when skipFirst is false', () => {
    const callback = jest.fn()

    renderHook(() => {
      useDebouncedCallback(callback, 'value', 1000, false)
    })

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should debounce callback on value change', () => {
    const callback = jest.fn()

    const {rerender} = renderHook(
      ({value}) => {
        useDebouncedCallback(callback, value, 1000, false)
      },
      {initialProps: {value: 'initial'}},
    )

    act(() => {
      jest.advanceTimersByTime(500)
    })

    rerender({value: 'updated'})

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should cancel previous callback on rapid changes', () => {
    const callback = jest.fn()

    const {rerender} = renderHook(
      ({value}) => {
        useDebouncedCallback(callback, value, 1000, false)
      },
      {initialProps: {value: 'value1'}},
    )

    act(() => {
      jest.advanceTimersByTime(500)
    })

    rerender({value: 'value2'})

    act(() => {
      jest.advanceTimersByTime(500)
    })

    rerender({value: 'value3'})

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
