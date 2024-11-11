import {createOrder, cancelOrder, getOrders, getCompletedOrders} from './orders'
import axios from 'axios'
import {axiosClient} from './config'

jest.mock('./config')

const ADA_TOKEN = {
  policyId: '',
  assetName: '',
}

const GENS_TOKEN = {
  policyId: 'dda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb',
  assetName: '0014df1047454e53',
}

describe('SwapOrdersApi', () => {
  describe('getOrders', () => {
    it('Should return orders list using staking key hash', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axios>
      mockAxios.get.mockImplementationOnce(() =>
        Promise.resolve({
          data: mockedOrders,
          status: 200,
        }),
      )
      const result = await getOrders(
        {network: 'preprod', client: mockAxios},
        {
          stakeKeyHash:
            '24fd15671a17a39268b7a31e2a6703f5893f254d4568411322baeeb7',
        },
      )
      expect(result).toHaveLength(1)
    })

    it('Should throws an error', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axios>
      mockAxios.get.mockImplementationOnce(() =>
        Promise.resolve({
          data: 'fake-error',
          status: 400,
        }),
      )
      await expect(() =>
        getOrders(
          {network: 'preprod', client: mockAxios},
          {
            stakeKeyHash:
              '24fd15671a17a39268b7a31e2a6703f5893f254d4568411322baeeb7',
          },
        ),
      ).rejects.toThrowError(
        /^Failed to get orders for 24fd15671a17a39268b7a31e2a6703f5893f254d4568411322baeeb7$/,
      )
    })
  })

  describe('getCompletedOrders', () => {
    it('Should return orders list using staking key hash', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axios>
      mockAxios.get.mockImplementationOnce(() =>
        Promise.resolve({
          data: mockedCompleteOrders,
          status: 200,
        }),
      )
      const result = await getCompletedOrders(
        {network: 'preprod', client: mockAxios},
        {
          stakeKeyHash:
            '24fd15671a17a39268b7a31e2a6703f5893f254d4568411322baeeb7',
        },
      )
      expect(result).toHaveLength(1)
    })

    it('Should throws an error', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axios>
      mockAxios.get.mockImplementationOnce(() =>
        Promise.resolve({
          data: 'fake-error',
          status: 400,
        }),
      )
      await expect(() =>
        getCompletedOrders(
          {network: 'preprod', client: mockAxios},
          {
            stakeKeyHash:
              '24fd15671a17a39268b7a31e2a6703f5893f254d4568411322baeeb7',
          },
        ),
      ).rejects.toThrowError(
        /^Failed to get orders for 24fd15671a17a39268b7a31e2a6703f5893f254d4568411322baeeb7$/,
      )
    })
  })

  describe('createOrder', () => {
    it('should create order and return datum, datumHash, and contract address', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axios>
      mockAxios.get.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: mockedCreateOrderResult,
        }),
      )

      const order = await createOrder(
        {network: 'mainnet', client: mockAxios},
        createOrderParams,
      )

      expect(order).toEqual(mockedCreateOrderResult)
    })

    it('should throw error for invalid order: custom message', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axios>
      mockAxios.get.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: {status: 'failed', reason: 'error_message'},
        }),
      )
      await expect(() =>
        createOrder({network: 'preprod', client: mockAxios}, createOrderParams),
      ).rejects.toThrowError(/^error_message$/)
    })

    it('should throw error for invalid order: default message', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axios>
      mockAxios.get.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: {status: 'failed'},
        }),
      )
      await expect(() =>
        createOrder({network: 'preprod', client: mockAxios}, createOrderParams),
      ).rejects.toThrowError(/^Unexpected error occurred$/)
    })

    it('should throw generic error for invalid response', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axios>
      await expect(async () => {
        mockAxios.get.mockImplementationOnce(() =>
          Promise.resolve({status: 400}),
        )
        await createOrder(
          {network: 'mainnet', client: mockAxios},
          createOrderParams,
        )
      }).rejects.toThrow('Failed to construct swap datum')
    })
  })

  describe('cancelOrder', () => {
    it('should cancel pending orders', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axios>
      mockAxios.get.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: {cbor: 'tx_cbor'},
        }),
      )

      const txCbor = await cancelOrder(
        {network: 'mainnet', client: mockAxios},
        {
          orderUTxO: 'orderUtxo',
          collateralUTxO: 'collateralUtxo',
          walletAddress:
            'addr1q9ndnrwz52yeex4j04kggp0ul5632qmxqx22ugtukkytjysw86pdygc6zarl2kks6fvg8um447uvv679sfdtzkwf2kuq673wke',
        },
      )

      expect(txCbor).toBe('tx_cbor')
    })

    it('should throw generic error for invalid response', async () => {
      const mockAxios = axiosClient as jest.Mocked<typeof axios>
      mockAxios.get.mockImplementationOnce(() => Promise.resolve({status: 400}))
      await expect(() =>
        cancelOrder(
          {network: 'mainnet', client: mockAxios},
          {
            orderUTxO: cancelOrderParams.utxo,
            collateralUTxO: cancelOrderParams.collateralUTxOs,
            walletAddress: cancelOrderParams.address,
          },
        ),
      ).rejects.toThrow('Failed to cancel swap transaction')
    })
  })
})

const mockedOrders = [
  {
    from: {
      amount: '1000000',
      token: '.',
    },
    to: {
      amount: '41372',
      token:
        '2adf188218a66847024664f4f63939577627a56c090f679fe366c5ee.535441424c45',
    },
    sender:
      'addr1qy0556dz9jssrrnhv0g3ga98uczdd465cut9jjs5a4k5qy3yl52kwxsh5wfx3darrc4xwql43ylj2n29dpq3xg46a6mska8vfz',
    owner:
      'addr1qy0556dz9jssrrnhv0g3ga98uczdd465cut9jjs5a4k5qy3yl52kwxsh5wfx3darrc4xwql43ylj2n29dpq3xg46a6mska8vfz',
    ownerPubKeyHash: '1f4a69a22ca1018e7763d11474a7e604d6d754c716594a14ed6d4012',
    ownerStakeKeyHash:
      '24fd15671a17a39268b7a31e2a6703f5893f254d4568411322baeeb7',
    batcherFee: {
      amount: '950000',
      token: '.',
    },
    deposit: '1700000',
    valueAttached: [
      {
        amount: '3650000',
        token: '.',
      },
    ],
    utxo: '1e977694e2413bd0e6105303bb44da60530cafe49b864dde8f8902b021ed86ba#0',
    provider: 'muesliswap_v4',
    feeField: '2650000',
    allowPartial: true,
  },
]

const mockedCreateOrderResult = {
  status: 'success',
  datum:
    'd8799fd8799fd8799fd8799f581c353b8bc29a15603f0b73eac44653d1bd944d92e0e0dcd5eb185164a2ffd8799fd8799fd8799f581cda22c532206a75a628778eebaf63826f9d93fbe9b4ac69a7f8e4cd78ffffffff581c353b8bc29a15603f0b73eac44653d1bd944d92e0e0dcd5eb185164a21b00000188f2408726d8799fd8799f4040ffd8799f581cdda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb480014df1047454e53ffffffd8799fd879801a0006517affff',
  hash: '4ae3fc5498e9d0f04daaf2ee739e41dc3f6f4119391e7274f0b3fa15aa2163ff',
  address: 'addr1wxr2a8htmzuhj39y2gq7ftkpxv98y2g67tg8zezthgq4jkg0a4ul4',
}

const createOrderParams = {
  walletAddress:
    'addr1qy0556dz9jssrrnhv0g3ga98uczdd465cut9jjs5a4k5qy3yl52kwxsh5wfx3darrc4xwql43ylj2n29dpq3xg46a6mska8vfz',
  protocol: 'sundaeswap',
  poolId: '14',
  sell: {
    ...ADA_TOKEN,
    amount: '25000000',
  },
  buy: {
    ...GENS_TOKEN,
    amount: '50000000',
  },
} as const

const cancelOrderParams = {
  utxo: '6c4b4e55301d79128071f05a018cf05b7de86bc3f92d05b6668423e220152a86',
  collateralUTxOs:
    '6c4b4e55301d79128071f05a018cf05b7de86bc3f92d05b6668423e220152a86',
  address:
    'addr1qy0556dz9jssrrnhv0g3ga98uczdd465cut9jjs5a4k5qy3yl52kwxsh5wfx3darrc4xwql43ylj2n29dpq3xg46a6mska8vfz',
} as const

const mockedCompleteOrders = [
  {
    status: 'matched',
    utxo: '6c4b4e55301d79128071f05a018cf05b7de86bc3f92d05b6668423e220152a86',
    collateralUTxOs:
      '6c4b4e55301d79128071f05a018cf05b7de86bc3f92d05b6668423e220152a86',
    address:
      'addr1qy0556dz9jssrrnhv0g3ga98uczdd465cut9jjs5a4k5qy3yl52kwxsh5wfx3darrc4xwql43ylj2n29dpq3xg46a6mska8vfz',
  },
] as const
