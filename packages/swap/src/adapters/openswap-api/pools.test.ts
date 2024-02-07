import {getLiquidityPools, getPoolsPair} from './pools'
import {axiosClient} from './config'
import {LiquidityPoolResponse, PoolPairResponse} from './types'

jest.mock('./config')

describe('SwapPoolsApi', () => {
  describe('getLiquidityPools', () => {
    it('should get liquidity pools list for a given token pair', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
      mockAxios.get.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: mockedLiquidityPoolsResponse,
        }),
      )

      const result = await getLiquidityPools(
        {network: 'mainnet', client: mockAxios},
        {
          tokenA: getLiquidityPoolsParams.sell,
          tokenB: getLiquidityPoolsParams.buy,
          providers: getLiquidityPoolsParams.providers,
        },
      )
      expect(result).toHaveLength(1)
    })

    it('should throw error for invalid response', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
      await expect(async () => {
        mockAxios.get.mockImplementationOnce(() =>
          Promise.resolve({status: 500}),
        )
        await getLiquidityPools(
          {network: 'preprod', client: mockAxios},
          {
            tokenA: getLiquidityPoolsParams.sell,
            tokenB: getLiquidityPoolsParams.buy,
            providers: getLiquidityPoolsParams.providers,
          },
        )
      }).rejects.toThrow('Failed to fetch liquidity pools for token pair')
    })
  })

  describe('getPoolsPair', () => {
    it('should get pools pair list for a given token pair', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
      mockAxios.get.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: mockedPoolsPairResponse,
        }),
      )

      const result = await getPoolsPair(
        {network: 'mainnet', client: mockAxios},
        {tokenA: getPoolsPairParams.sell, tokenB: getPoolsPairParams.buy},
      )
      expect(result).toHaveLength(1)
    })

    it('should throw error for invalid response', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>
      await expect(async () => {
        mockAxios.get.mockImplementationOnce(() =>
          Promise.resolve({status: 500}),
        )
        await getPoolsPair(
          {network: 'preprod', client: mockAxios},
          {tokenA: getPoolsPairParams.sell, tokenB: getPoolsPairParams.buy},
        )
      }).rejects.toThrow('Failed to fetch pools pair for token pair')
    })
  })
})

const mockedPoolsPairResponse: Readonly<PoolPairResponse> = [
  {
    provider: 'minswap',
    fee: '0.3',
    tokenA: {
      amount: '1233807687',
      token: '.',
    },
    tokenB: {
      amount: '780',
      token:
        'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72.43414b45',
    },
    price: 0,
    batcherFee: {
      amount: '2000000',
      token: '.',
    },
    depositFee: {
      amount: '2000000',
      token: '.',
    },
    deposit: 2000000,
    utxo: '0596860b5970ef989c56f7ae38b3c0f74bb4979ac15ee994c30760f7f4d908ce#0',
    poolId:
      '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    timestamp: '2023-05-31 07:03:41',
    lpToken: {
      amount: '981004',
      token:
        'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    },
    batcherAddress:
      'addr1wxaptpmxcxawvr3pzlhgnpmzz3ql43n2tc8mn3av5kx0yzs09tqh8',
  },
]

const getPoolsPairParams = {
  sell: {
    policyId: '',
    assetNameHex: '',
  },
  buy: {
    policyId: 'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72',
    assetNameHex: '43414b45',
  },
} as const

const mockedLiquidityPoolsResponse: Readonly<LiquidityPoolResponse> = [
  {
    tokenA: {
      address: {
        policyId: '',
        name: '',
      },
      symbol: 'ADA',
      image: 'https://static.muesliswap.com/images/tokens/ada.png',
      decimalPlaces: 6,
      amount: '1000000',
      status: 'verified',
      priceAda: 1,
    },
    tokenB: {
      address: {
        policyId: '9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77',
        name: '53554e444145',
      },
      symbol: 'SUNDAE',
      image:
        'https://tokens.muesliswap.com/static/img/tokens/9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77.53554e444145.png',
      decimalPlaces: 6,
      amount: '100000',
      status: 'verified',
      priceAda: 0.02567846556,
    },
    feeToken: {
      address: {
        policyId: '',
        name: '',
      },
      symbol: 'ADA',
      image: 'https://static.muesliswap.com/images/tokens/ada.png',
      decimalPlaces: 6,
    },
    batcherFee: '2500000',
    lvlDeposit: '2000000',
    poolFee: '1.00',
    lpToken: {
      address: {
        policyId: '0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913',
        name: '6c7020dc',
      },
      amount: '316227',
    },
    poolId: '0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913.7020dc',
    provider: 'sundaeswap',
    txHash: 'f2c5186fc53546db16a52c3bec25598e69518aaa8486919074c42e8927533f4c',
    outputIdx: 1,
    volume24h: 0,
    volume7d: 0,
    liquidityApy: 0,
    priceASqrt: null,
    priceBSqrt: null,
    batcherAddress:
      'addr1wxaptpmxcxawvr3pzlhgnpmzz3ql43n2tc8mn3av5kx0yzs09tqh8',
  },
]

const getLiquidityPoolsParams = {
  sell: '',
  buy: 'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72.43414b45',
  providers: ['minswap'],
} as const
