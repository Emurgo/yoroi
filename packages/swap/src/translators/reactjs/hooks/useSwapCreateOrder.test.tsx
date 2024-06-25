import {QueryClient} from '@tanstack/react-query'
import {renderHook, act} from '@testing-library/react-hooks'

import {queryClientFixture} from '../../../fixtures/query-client'
import {mockSwapManager} from '../../../manager.mocks'
import {apiMocks} from '../../../adapters/openswap-api/api.mocks'
import {useSwapCreateOrder} from './useSwapCreateOrder'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'

describe('useSwapCreateOrder', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('success', async () => {
    mockSwapManager.order.create = jest.fn().mockResolvedValue(undefined)
    const wrapper = wrapperManagerFixture({
      queryClient,
      swapManager: mockSwapManager,
    })

    const {result, waitFor: waitForHook} = renderHook(
      () => useSwapCreateOrder(),
      {wrapper},
    )

    await act(async () =>
      result.current.createOrderData(apiMocks.createOrderData),
    )

    await waitForHook(() => expect(result.current.isLoading).toBe(false))

    expect(mockSwapManager.order.create).toHaveBeenCalledTimes(1)
    expect(mockSwapManager.order.create).toHaveBeenCalledWith(
      apiMocks.createOrderData,
    )
    expect(result.current.isError).toBe(false)
  })
})
