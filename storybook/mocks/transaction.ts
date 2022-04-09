import BigNumber from 'bignumber.js'
import {TransactionInfo} from '../../src/legacy/HistoryTransaction'

export const mockTransaction = (transaction?: Partial<TransactionInfo>): TransactionInfo => {
  return {
    id: 'ef147cbd5ccb0b0907a2969a697aeb06117ac83f284ddfae53a4198b03719b52',
    inputs: [
      {
        address:
          'addr_test1qqtrcd6qlxy8m30le0e044nj5nesvc322jzjjsv29zxdfpqxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flknsef5gyw',
        amount: '481040108',
        assets: [
          {
            identifier: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
            amount: new BigNumber('1407406'),
            networkId: 1,
          },
        ],
      },
    ],
    outputs: [
      {
        address:
          'addr_test1qrpqpz326zuufgk3u7sygxls2wl0ec9zrappl6zyf0n2v9r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qezrvwq',
        amount: '1407406',
        assets: [
          {
            identifier: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
            amount: new BigNumber('1407406'),
            networkId: 1,
          },
        ],
      },
      {
        address:
          'addr_test1qq022ftqww7e0kwz4mc2n3aaa78hvh7lytn9v6e0wtfllfcxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flkns5a8lc9',
        amount: '479460117',
        assets: [
          {
            identifier: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
            amount: new BigNumber('172585'),
            networkId: 1,
          },
        ],
      },
    ],
    amount: [
      {
        identifier: '',
        networkId: 1,
        amount: '1407406',
        isDefault: true,
      },
      {
        identifier: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
        networkId: 1,
        amount: '2',
        isDefault: false,
      },
    ],
    fee: undefined,
    delta: [
      {
        identifier: '',
        networkId: 1,
        amount: '1407406',
        isDefault: true,
      },
      {
        identifier: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
        networkId: 1,
        amount: '2',
        isDefault: false,
      },
    ],
    confirmations: 100,
    direction: 'RECEIVED',
    submittedAt: '2021-02-19T15:53:36.000Z',
    lastUpdatedAt: '2021-02-19T15:53:36.000Z',
    status: 'SUCCESSFUL',
    assurance: 'HIGH',
    tokens: {
      '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.': {
        networkId: 1,
        isDefault: false,
        identifier: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
        metadata: {
          policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
          assetName: '',
          type: 'Cardano',
          numberOfDecimals: 0,
          ticker: null,
          longName: null,
          maxSupply: null,
        },
      },
    },
    ...transaction,
  }
}
