import {QueryClient} from '@tanstack/react-query'
import {renderHook, act, waitFor} from '@testing-library/react'

import {queryClientFixture} from '../../../fixtures/query-client'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {resolverManagerMocks} from '../../manager.mocks'
import {useResolverSetShowNotice} from './useResolverSetShowNotice'

describe('useResolverSetShowNotice', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const mockResolverManager = {...resolverManagerMocks.success}

  it('success', async () => {
    mockResolverManager.showNotice.save = jest.fn().mockResolvedValue(undefined)
    const wrapper = wrapperManagerFixture({
      queryClient,
      resolverManager: mockResolverManager,
    })

    const {result} = renderHook(() => useResolverSetShowNotice(), {wrapper})

    await act(async () => result.current.setShowNotice(true))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockResolverManager.showNotice.save).toHaveBeenCalledTimes(1)
    expect(mockResolverManager.showNotice.save).toHaveBeenCalledWith(true)
    expect(result.current.isError).toBe(false)
  })
})
