import {describe, expect, it, vi, Mocked} from 'vitest'
import {getPrice} from './price'
import {axiosClient} from './config'
import {PriceAddress, PriceResponse} from './types'

vi.mock('./config.ts')

describe('SwapPoolsApi', () => {
  it('should get price for the pair token', async () => {
    const mockAxios = axiosClient as Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: mockedPriceResponse,
      }),
    )

    const result = await getPrice(
      {network: 'mainnet', client: mockAxios},
      {
        ...getPriceParams,
      },
    )
    expect(result).to.be.equal(mockedPriceResponse)
  })

  it('should throw error for invalid response', async () => {
    const mockAxios = axiosClient as Mocked<typeof axiosClient>
    await expect(async () => {
      mockAxios.get.mockImplementationOnce(() => Promise.resolve({status: 500}))
      await getPrice(
        {network: 'preprod', client: mockAxios},
        {...getPriceParams},
      )
    }).rejects.toThrow('Failed to fetch price for token pair')
  })
})

const mockedPriceResponse: PriceResponse = {
  baseDecimalPlaces: 6,
  quoteDecimalPlaces: 6,
  baseAddress: {
    policyId: '',
    name: '',
  },
  quoteAddress: {
    policyId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
    name: '4d494e',
  },
  askPrice: 0.08209814208,
  bidPrice: 0.06319999985,
  price: 0.07080044463,
  volume: {
    base: '14735349',
    quote: '211287611',
  },
  volumeAggregator: {
    minswap: {
      quote: 107413106646,
      base: 7651672996,
    },
    sundaeswap: {
      quote: 566084169,
      base: 39000000,
    },
    vyfi: {
      quote: 12370434748,
      base: 879028993,
    },
  },
  volumeTotal: {
    base: 8584437338,
    quote: 120560913174,
  },
  volumeChange: {
    base: 0,
    quote: 0,
  },
  priceChange: {
    '24h': '-0.2374956426253183',
    '7d': '8.757469657697857',
  },
  marketCap: 68873484244745.086,
} as const

const getPriceParams: {
  baseToken: PriceAddress
  quoteToken: PriceAddress
} = {
  baseToken: {
    policyId: '',
    name: '',
  },
  quoteToken: {
    policyId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
    name: '4d494e',
  },
} as const
