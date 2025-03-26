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

    ;(manager.dismissedAt as jest.Mock).mockReturnValueOnce(dismissedAt)

    const {result} = renderHook(() => useBanner({id, manager}))

    expect(result.current.dismissedAt).toBe(dismissedAt)
    expect(result.current.dismissedAt).toBe(dismissedAt)
  })

  it('should call dismiss method on manager', () => {
    const id = 'test-banner'
    const dismissedAt = 0

    ;(manager.dismissedAt as jest.Mock).mockReturnValueOnce(dismissedAt)

    const {result} = renderHook(() => useBanner({id, manager}))

    act(() => {
      result.current.dismiss()
    })

    expect(manager.dismiss).toHaveBeenCalledWith(id)
  })
})
