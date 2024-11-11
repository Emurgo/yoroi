import {getTokens} from './tokens'
import {axiosClient} from './config'

jest.mock('./config.ts')

describe('SwapTokensApi', () => {
  it('should get all supported tokens list', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({status: 200, data: mockedGetTokensResponse}),
    )

    const result = await getTokens({network: 'mainnet', client: mockAxios})

    expect(result).toHaveLength(1)
  })

  it('should throw error for invalid response', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() => Promise.resolve({status: 500}))

    await expect(() =>
      getTokens({network: 'mainnet', client: mockAxios}),
    ).rejects.toThrow('Failed to fetch tokens')
  })

  it('should return empty array', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({status: 200, data: mockedGetTokensResponse}),
    )

    const result = await getTokens({network: 'preprod', client: mockAxios})

    expect(result).toHaveLength(0)
  })
})

const mockedGetTokensResponse = [
  {
    supply: {
      total: '10000000',
      circulating: '6272565',
    },
    status: 'verified',
    website: 'https://ada.muesliswap.com/',
    symbol: 'MILK',
    decimalPlaces: 0,
    image: 'https://static.muesliswap.com/images/tokens/MILK.png',
    description: 'MILK is the utility token powering the MuesliSwap ecosystem.',
    address: {
      policyId: '8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa',
      name: '4d494c4b',
    },
    categories: ['1', '2'],
  },
]
