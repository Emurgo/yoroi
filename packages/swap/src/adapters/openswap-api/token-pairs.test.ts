import {getTokenPairs} from './token-pairs'
import {axiosClient} from './config'

jest.mock('./config.ts')

describe('SwapTokenPairsApi', () => {
  it('should get all tokens based pairs', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({status: 200, data: mockedGetTokenPairsResponse}),
    )

    const result = await getTokenPairs({network: 'mainnet', client: mockAxios})

    expect(result).toHaveLength(1)
  })

  it('should return empty list on preprod network', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>

    const result = await getTokenPairs({network: 'preprod', client: mockAxios})

    expect(result).toHaveLength(0)
  })

  it('should throw error for invalid response', async () => {
    const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() => Promise.resolve({status: 500}))
    await expect(() =>
      getTokenPairs({network: 'mainnet', client: mockAxios}),
    ).rejects.toThrow('Failed to fetch token pairs')
  })
})

const mockedGetTokenPairsResponse = [
  {
    info: {
      supply: {total: '1000000000000', circulating: null},
      status: 'unverified',
      image: 'ipfs://QmPzaykTy4yfutCtwv7nRUmgbQbA7euiThyy2i9fiFuDHX',
      imageIpfsHash: 'QmPzaykTy4yfutCtwv7nRUmgbQbA7euiThyy2i9fiFuDHX',
      symbol: 'ARGENT',
      minting: {
        type: 'time-lock-policy',
        blockchain: 'cardano',
        mintedBeforeSlotNumber: 91850718,
      },
      mediatype: 'image/png',
      tokentype: 'token',
      description: 'ARGENT Token',
      totalsupply: 1000000000000,
      address: {
        policyId: 'c04f4200502a998e9eebafac0291a1f38008de3fe146d136946d8f4b',
        name: '415247454e54',
      },
      decimalPlaces: 0,
      categories: [],
    },
    price: {
      volume: {base: 0, quote: 0},
      volumeChange: {base: 0, quote: 0},
      volumeTotal: {base: 0, quote: 0},
      volumeAggregator: {},
      price: 0,
      askPrice: 0,
      bidPrice: 0,
      priceChange: {'24h': 0, '7d': 0},
      quoteDecimalPlaces: 0,
      baseDecimalPlaces: 6,
      quoteAddress: {
        policyId: 'c04f4200502a998e9eebafac0291a1f38008de3fe146d136946d8f4b',
        name: '415247454e54',
      },
      baseAddress: {policyId: '', name: ''},
      price10d: [],
    },
  },
]
