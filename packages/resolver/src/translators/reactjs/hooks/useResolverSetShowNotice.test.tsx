import {renderHook, act, waitFor} from '@testing-library/react-native'

import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {resolverManagerMocks} from '../../manager.mocks'
import {useResolverSetShowNotice} from './useResolverSetShowNotice'

describe('useResolverSetShowNotice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockResolverManager = {...resolverManagerMocks.success}

  it('success', async () => {
    mockResolverManager.showNotice.save = jest.fn().mockResolvedValue(undefined)
    const wrapper = wrapperManagerFixture({
      resolverManager: mockResolverManager,
    })

    const {result} = renderHook(() => useResolverSetShowNotice(), {wrapper})

    await act(async () => result.current.setShowNotice(true))

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(mockResolverManager.showNotice.save).toHaveBeenCalledTimes(1)
    expect(mockResolverManager.showNotice.save).toHaveBeenCalledWith(true)
    expect(result.current.isError).toBe(false)
  })

  it('error', async () => {
    const testError = new Error('Test error')
    mockResolverManager.showNotice.save = jest.fn().mockRejectedValue(testError)
    const wrapper = wrapperManagerFixture({
      resolverManager: mockResolverManager,
    })

    const {result} = renderHook(() => useResolverSetShowNotice(), {wrapper})

    await act(async () => {
      try {
        await result.current.setShowNotice(true)
      } catch (err) {
        // Expected to throw
      }
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(mockResolverManager.showNotice.save).toHaveBeenCalledTimes(1)
    expect(mockResolverManager.showNotice.save).toHaveBeenCalledWith(true)
    expect(result.current.error).toBe(testError)
  })
})
