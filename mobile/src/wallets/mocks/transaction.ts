import {Balance} from '@yoroi/types'

import BigNumber from 'bignumber.js'

import {CardanoTypes} from '../cardano/types'
import {TransactionInfo} from '../types/other'

export const mockTransactionInfos: Record<string, TransactionInfo> = {
  'ef147cbd5ccb0b0907a2969a697aeb06117ac83f284ddfae53a4198b03719b52': {
    id: 'ef147cbd5ccb0b0907a2969a697aeb06117ac83f284ddfae53a4198b03719b52',
    inputs: [
      {
        address:
          'addr_test1vzpwq95z3xyum8vqndgdd9mdnmafh3djcxnc6jemlgdmswcve6tkw',
        amount: '481040108',
        assets: [
          {
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            amount: new BigNumber('1407406'),
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
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            amount: new BigNumber('1407406'),
          },
        ],
      },
      {
        address:
          'addr_test1qq022ftqww7e0kwz4mc2n3aaa78hvh7lytn9v6e0wtfllfcxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flkns5a8lc9',
        amount: '479460117',
        assets: [
          {
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as CardanoTypes.TokenEntry['identifier'],
            amount: new BigNumber('172585'),
          },
        ],
      },
    ],
    amount: {
      '.': '1626373838' as Balance.Quantity,
      '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7':
        '2' as Balance.Quantity,
    },
    fee: undefined,
    delta: {
      '.': '1407406' as Balance.Quantity,
      '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7':
        '2' as Balance.Quantity,
    },
    confirmations: 100,
    blockNumber: 50000,
    direction: 'RECEIVED',
    submittedAt: '2021-02-19T15:53:36.000Z',
    lastUpdatedAt: '2021-02-19T15:53:36.000Z',
    status: 'Successful',
    assurance: 'HIGH',
    tokens: {
      '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7': {
        isDefault: false,
        identifier: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
        policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
        assetName: '',
        numberOfDecimals: 0,
        ticker: null,
        longName: null,
      },
    },
    memo: null,
    metadata: {},
  },
  '5e7eff1b687f538066ea08938e91ba562c88dc817782816a1fc6f1560d8905e8': {
    id: '5e7eff1b687f538066ea08938e91ba562c88dc817782816a1fc6f1560d8905e8',
    inputs: [
      {
        address:
          'addr_test1qqtrcd6qlxy8m30le0e044nj5nesvc322jzjjsv29zxdfpqxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flknsef5gyw',
        amount: '481040108',
        assets: [
          {
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as CardanoTypes.TokenEntry['identifier'],
            amount: new BigNumber('1654170'),
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
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as CardanoTypes.TokenEntry['identifier'],
            amount: new BigNumber('1654170'),
          },
        ],
      },
      {
        address:
          'addr_test1qq022ftqww7e0kwz4mc2n3aaa78hvh7lytn9v6e0wtfllfcxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flkns5a8lc9',
        amount: '479460117',
        assets: [
          {
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as CardanoTypes.TokenEntry['identifier'],
            amount: new BigNumber('1654170'),
          },
        ],
      },
    ],
    amount: {
      '.': '2727272727' as Balance.Quantity,
      '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7':
        '2' as Balance.Quantity,
    },
    fee: undefined,
    delta: {
      '.': '1407406' as Balance.Quantity,
      '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7':
        '2' as Balance.Quantity,
    },
    confirmations: 100,
    blockNumber: 50000,
    direction: 'RECEIVED',
    submittedAt: '2022-03-20T10:22:12.000Z',
    lastUpdatedAt: '2022-03-20T10:22:12.000Z',
    status: 'Successful',
    assurance: 'HIGH',
    tokens: {
      '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7': {
        isDefault: false,
        identifier: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
        policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
        assetName: '',
        numberOfDecimals: 0,
        ticker: null,
        longName: null,
      },
    },
    memo: null,
    metadata: {},
  },
  '0953a5e90889ed0b2ea1e3230cccde871d90c17868aea22300716ecaeec93096': {
    id: '0953a5e90889ed0b2ea1e3230cccde871d90c17868aea22300716ecaeec93096',
    inputs: [
      {
        address:
          'addr_test1qqtrcd6qlxy8m30le0e044nj5nesvc322jzjjsv29zxdfpqxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flknsef5gyw',
        amount: '481040108',
        assets: [
          {
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            amount: new BigNumber('1407406'),
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
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            amount: new BigNumber('1407406'),
          },
        ],
      },
      {
        address:
          'addr_test1qq022ftqww7e0kwz4mc2n3aaa78hvh7lytn9v6e0wtfllfcxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flkns5a8lc9',
        amount: '479460117',
        assets: [
          {
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as CardanoTypes.TokenEntry['identifier'],
            amount: new BigNumber('172585'),
          },
        ],
      },
    ],
    amount: {
      '.': '1407406' as Balance.Quantity,
      '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7':
        '2' as Balance.Quantity,
    },
    fee: undefined,
    delta: {
      '.': '1407406' as Balance.Quantity,
      '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7':
        '2' as Balance.Quantity,
    },
    confirmations: 100,
    blockNumber: 50000,
    direction: 'RECEIVED',
    submittedAt: '2021-02-19T11:11:36.000Z',
    lastUpdatedAt: '2021-02-19T11:11:36.000Z',
    status: 'Successful',
    assurance: 'HIGH',
    tokens: {
      '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7': {
        isDefault: false,
        identifier: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
        policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
        assetName: '',
        numberOfDecimals: 0,
        ticker: null,
        longName: null,
      },
    },
    memo: null,
    metadata: {},
  },
}

export const mockTransactionInfo = (
  transaction?: Partial<TransactionInfo>,
): TransactionInfo => {
  return {
    id: 'ef147cbd5ccb0b0907a2969a697aeb06117ac83f284ddfae53a4198b03719b52',
    inputs: [
      {
        address:
          'addr_test1qqtrcd6qlxy8m30le0e044nj5nesvc322jzjjsv29zxdfpqxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flknsef5gyw',
        amount: '481040108',
        assets: [
          {
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            amount: new BigNumber('1407406'),
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
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
            amount: new BigNumber('1407406'),
          },
        ],
      },
      {
        address:
          'addr_test1qq022ftqww7e0kwz4mc2n3aaa78hvh7lytn9v6e0wtfllfcxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flkns5a8lc9',
        amount: '479460117',
        assets: [
          {
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as CardanoTypes.TokenEntry['identifier'],
            amount: new BigNumber('172585'),
          },
        ],
      },
    ],
    amount: {
      '.': '1407406' as Balance.Quantity,
      '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7':
        '2' as Balance.Quantity,
    },
    fee: undefined,
    delta: {
      '.': '1407406' as Balance.Quantity,
      '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7':
        '2' as Balance.Quantity,
    },
    confirmations: 100,
    blockNumber: 50000,
    direction: 'RECEIVED',
    submittedAt: '2021-02-19T15:53:36.000Z',
    lastUpdatedAt: '2021-02-19T15:53:36.000Z',
    status: 'Successful',
    assurance: 'HIGH',
    tokens: {
      '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7': {
        isDefault: false,
        identifier: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
        policyId: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
        assetName: '',
        numberOfDecimals: 0,
        ticker: null,
        longName: null,
      },
    },
    memo: null,
    metadata: {},
    ...transaction,
  }
}
