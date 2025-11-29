import {primaryTokenId} from '@yoroi/portfolio'
import {Portfolio, Swap, TokenId} from '@yoroi/types'

import {getPtPrice} from './getPtPrice'

describe('getPtPrice', () => {
  const primaryTokenInfo = {id: primaryTokenId} as Portfolio.Token.Info

  it('should return netPrice if estimate API call returns a Right response', async () => {
    const mockEstimate = jest.fn().mockResolvedValue({
      tag: 'right',
      value: {
        status: 200,
        data: {
          netPrice: 100,
        },
      },
    })

    const api = {
      estimate: mockEstimate,
    } as unknown as Swap.Api

    const price = await getPtPrice(
      primaryTokenInfo,
      api,
    )('some.TokenId' as TokenId)
    expect(price).toBe(100)
  })

  it('should return 0 if estimate API call returns a Left response', async () => {
    const mockEstimate = jest.fn().mockResolvedValue({
      tag: 'left',
      error: {
        status: 500,
        message: 'Server error',
        responseData: {},
      },
    })

    const api = {
      estimate: mockEstimate,
    } as unknown as Swap.Api

    const price = await getPtPrice(
      primaryTokenInfo,
      api,
    )('some.TokenId' as TokenId)
    expect(price).toBe(0)
  })

  it('should return 1 if the token is the primary token', async () => {
    const mockEstimate = jest.fn()

    const api = {
      estimate: mockEstimate,
    } as unknown as Swap.Api

    const price = await getPtPrice(primaryTokenInfo, api)(primaryTokenInfo.id)
    expect(price).toBe(1)
    expect(mockEstimate).not.toHaveBeenCalled()
  })

  it('should return cached price if available', async () => {
    const mockEstimate = jest.fn().mockResolvedValue({
      tag: 'right',
      value: {
        status: 200,
        data: {
          netPrice: 100,
        },
      },
    })

    const api = {
      estimate: mockEstimate,
    } as unknown as Swap.Api

    const getPrice = getPtPrice(primaryTokenInfo, api)
    const price1 = await getPrice('some.TokenId' as TokenId)
    expect(price1).toBe(100)

    // Change the mock to return a different value to ensure the cache is used
    mockEstimate.mockResolvedValueOnce({
      tag: 'right',
      value: {
        status: 200,
        data: {
          netPrice: 200,
        },
      },
    })

    const price2 = await getPrice('some.TokenId' as TokenId)
    expect(price2).toBe(100) // Should return the cached price
    expect(mockEstimate).toHaveBeenCalledTimes(1)
  })
})
