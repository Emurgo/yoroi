import {describe, expect, it, vi, Mocked} from 'vitest'
import {getPools} from './pools'
import {axiosClient} from './config'

vi.mock('./config.ts')

describe('SwapPoolsApi', () => {
  it('should get pools list for a given token pair', async () => {
    const mockAxios = axiosClient as Mocked<typeof axiosClient>
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        data: mockedPoolRes,
      }),
    )

    const result = await getPools(
      {network: 'mainnet', client: mockAxios},
      {tokenA: getPoolsParams.sell, tokenB: getPoolsParams.buy},
    )
    expect(result).to.be.of.lengthOf(1)
  })

  it('should throw error for invalid response', async () => {
    const mockAxios = axiosClient as Mocked<typeof axiosClient>
    await expect(async () => {
      mockAxios.get.mockImplementationOnce(() => Promise.resolve({status: 500}))
      await getPools(
        {network: 'preprod', client: mockAxios},
        {tokenA: getPoolsParams.sell, tokenB: getPoolsParams.buy},
      )
    }).rejects.toThrow('Failed to fetch pools for token pair')
  })
})

const mockedPoolRes = [
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
    price: 1581804.726923077,
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
  },
]

const getPoolsParams = {
  sell: {
    policyId: '',
    assetNameHex: '',
  },
  buy: {
    policyId: 'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72',
    assetNameHex: '43414b45',
  },
} as const
