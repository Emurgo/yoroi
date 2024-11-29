import {Api} from '@yoroi/types'

export const mockUtxoData: Api.Cardano.UtxoData = {
  output: {
    address:
      'addr1q9w4kymw3vt4s23qgjg8rvjzpuk9jk9slg2c9x88vrl4lkh3nxw8l8g6luf7mx5kwjl0gsv9hx7nlg93w3kls5tkx34s3nl4zg',
    amount: '5000000',
    dataHash: null,
    assets: [
      {
        assetId:
          '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f.444444',
        policyId: '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f',
        name: 'asset-1',
        amount: '44',
      },
      {
        assetId: '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f.',
        policyId: '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f',
        name: '',
        amount: '1000',
      },
    ],
  },
  spendingTxHash:
    '4e3c2b1a0f9e8d7c6b5a4e3f2g1h0i9j8k7l6m5n4o3p2q1r0s9t8u7v6w5x4y3z2',
}
