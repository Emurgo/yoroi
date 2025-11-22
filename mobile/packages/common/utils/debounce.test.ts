import {debounce} from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should call callback after delay', () => {
    const callback = jest.fn()
    const {call} = debounce(callback, 100)

    call()
    expect(callback).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should cancel previous call when called multiple times', () => {
    const callback = jest.fn()
    const {call} = debounce(callback, 100)

    call()
    call()
    call()

    jest.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should pass arguments to callback', () => {
    const callback = jest.fn()
    const {call} = debounce(callback, 100)

    call('arg1', 'arg2')
    jest.advanceTimersByTime(100)

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should clear pending call when clear is called', () => {
    const callback = jest.fn()
    const {call, clear} = debounce(callback, 100)

    call()
    clear()
    jest.advanceTimersByTime(100)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should handle multiple calls with different delays', () => {
    const callback = jest.fn()
    const {call} = debounce(callback, 100)

    call()
    jest.advanceTimersByTime(50)
    call()
    jest.advanceTimersByTime(50)
    call()
    jest.advanceTimersByTime(100)

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
