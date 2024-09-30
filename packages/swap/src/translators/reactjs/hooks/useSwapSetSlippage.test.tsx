import * as React from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {renderHook, act} from '@testing-library/react-hooks'

import {SwapProvider} from '../provider/SwapProvider'
import {queryClientFixture} from '../../../fixtures/query-client'
import {mockSwapManager} from '../../../manager.mocks'
import {useSwapSetSlippage} from './useSwapSetSlippage'

jest.useFakeTimers()

describe('useSwapSetSlippage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    mockSwapManager.slippage.save = jest.fn().mockResolvedValue(undefined)
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager}>{children}</SwapProvider>
      </QueryClientProvider>
    )

    const {result, waitFor: waitForHook} = renderHook(
      () => useSwapSetSlippage(),
      {wrapper},
    )

    await act(async () => {
      result.current(1.1)
    })

    await waitForHook(() => expect(result.current).toBeDefined())

    expect(mockSwapManager.slippage.save).toHaveBeenCalledTimes(1)
    expect(mockSwapManager.slippage.save).toHaveBeenCalledWith(1.1)
  })
})
