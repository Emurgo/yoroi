import {renderHook, act} from '@testing-library/react-hooks'
import {Banners} from '@yoroi/types'

import {useBanner} from './useBanner'

describe('useBanner', () => {
  let manager: Banners.Manager

  beforeEach(() => {
    manager = {
      dismiss: jest.fn(),
      dismissedAt: jest.fn(),
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return the correct initial state', () => {
    const id = 'test-banner'
    const dismissedAt = 0
    const shouldShowCb = jest.fn().mockReturnValue(true)

    ;(manager.dismissedAt as jest.Mock).mockReturnValueOnce(dismissedAt)

    const {result} = renderHook(() => useBanner({id, manager, shouldShowCb}))

    expect(result.current.dismissedAt).toBe(dismissedAt)
    expect(result.current.shouldShow).toBe(true)
    expect(shouldShowCb).toHaveBeenCalledWith({dismissedAt})
  })

  it('should call dismiss method on manager', () => {
    const id = 'test-banner'
    const dismissedAt = 0
    const shouldShowCb = jest.fn().mockReturnValue(true)

    ;(manager.dismissedAt as jest.Mock).mockReturnValueOnce(dismissedAt)

    const {result} = renderHook(() => useBanner({id, manager, shouldShowCb}))

    act(() => {
      result.current.dismiss()
    })

    expect(manager.dismiss).toHaveBeenCalledWith(id)
  })

  it('should update shouldShow based on shouldShowCb', () => {
    const id = 'test-banner'
    const dismissedAt = 0
    const shouldShowCb = jest.fn().mockReturnValue(false)

    ;(manager.dismissedAt as jest.Mock).mockReturnValueOnce(dismissedAt)

    const {result} = renderHook(() => useBanner({id, manager, shouldShowCb}))

    expect(result.current.shouldShow).toBe(false)
    expect(shouldShowCb).toHaveBeenCalledWith({dismissedAt})
  })
})
