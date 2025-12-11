import {primaryTokenId} from '@yoroi/portfolio'
import {
  Address,
  Amount,
  AssetName,
  Balance,
  PolicyId,
  TokenId,
  TransactionHash,
} from '@yoroi/types'
// TransactionInfo is kept internally for deprecated code - import directly from source
import type {TransactionInfo} from '@yoroi/types'

import BigNumber from 'bignumber.js'

/**
 * Helper function to create a mock TransactionInfo without individual field casts
 * This allows writing mock data naturally while ensuring proper branding
 */
function createMockTransactionInfo(data: {
  id: string
  inputs: Array<{
    address: string
    amount: string
    assets?: Array<{
      identifier: string | TokenId
      amount: string | number | BigNumber
    }>
    id?: string
  }>
  outputs: Array<{
    address: string
    amount: string
    assets?: Array<{
      identifier: string | TokenId
      amount: string | number | BigNumber
    }>
  }>
  amount: Record<string, string>
  fee?: Record<string, string> | null
  delta: Record<string, string>
  confirmations: number
  blockNumber: number
  direction: string
  submittedAt?: string | null
  lastUpdatedAt: string
  status: string
  assurance: string
  tokens: Record<
    string,
    {
      isDefault: boolean
      identifier: string | TokenId
      policyId: string
      assetName: string
      numberOfDecimals: number
      ticker: string | null
      longName: string | null
    }
  >
  memo?: string | null
  metadata?: Record<string, any>
}): TransactionInfo {
  return {
    id: data.id as TransactionHash,
    inputs: data.inputs.map((input) => ({
      address: input.address as Address,
      amount: input.amount as Amount,
      assets: (input.assets ?? []).map((asset) => ({
        identifier: (typeof asset.identifier === 'string'
          ? asset.identifier
          : asset.identifier) as TokenId,
        amount:
          asset.amount instanceof BigNumber
            ? asset.amount
            : new BigNumber(asset.amount),
      })),
      id: input.id ? (input.id as TransactionHash) : undefined,
    })),
    outputs: data.outputs.map((output) => ({
      address: output.address as Address,
      amount: output.amount as Amount,
      assets: (output.assets ?? []).map((asset) => ({
        identifier: (typeof asset.identifier === 'string'
          ? asset.identifier
          : asset.identifier) as TokenId,
        amount:
          asset.amount instanceof BigNumber
            ? asset.amount
            : new BigNumber(asset.amount),
      })),
    })),
    amount: data.amount as Balance.Amounts,
    fee: data.fee ? (data.fee as Balance.Amounts) : undefined,
    delta: data.delta as Balance.Amounts,
    confirmations: data.confirmations,
    blockNumber: data.blockNumber,
    direction: data.direction as TransactionInfo['direction'],
    submittedAt: data.submittedAt ?? undefined,
    lastUpdatedAt: data.lastUpdatedAt,
    status: data.status as TransactionInfo['status'],
    assurance: data.assurance as TransactionInfo['assurance'],
    tokens: Object.fromEntries(
      Object.entries(data.tokens).map(([key, token]) => [
        key,
        {
          ...token,
          identifier: (typeof token.identifier === 'string'
            ? token.identifier
            : token.identifier) as TokenId,
          policyId: token.policyId as PolicyId,
          assetName: token.assetName as AssetName,
        },
      ]),
    ) as TransactionInfo['tokens'],
    memo: data.memo ?? null,
    metadata: data.metadata,
  }
}

const rawMockTransactionInfos = [
  {
    key: 'ef147cbd5ccb0b0907a2969a697aeb06117ac83f284ddfae53a4198b03719b52',
    data: {
      id: 'ef147cbd5ccb0b0907a2969a697aeb06117ac83f284ddfae53a4198b03719b52',
      inputs: [
        {
          address:
            'addr_test1vzpwq95z3xyum8vqndgdd9mdnmafh3djcxnc6jemlgdmswcve6tkw' as Address,
          amount: '481040108' as Amount,
          assets: [
            {
              identifier:
                '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
              amount: new BigNumber('1407406'),
            },
          ],
        },
      ],
      outputs: [
        {
          address:
            'addr_test1qrpqpz326zuufgk3u7sygxls2wl0ec9zrappl6zyf0n2v9r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qezrvwq' as Address,
          amount: '1407406' as Amount,
          assets: [
            {
              identifier:
                '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
              amount: new BigNumber('1407406'),
            },
          ],
        },
        {
          address:
            'addr_test1qq022ftqww7e0kwz4mc2n3aaa78hvh7lytn9v6e0wtfllfcxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flkns5a8lc9' as Address,
          amount: '479460117' as Amount,
          assets: [
            {
              identifier:
                '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
              amount: new BigNumber('172585'),
            },
          ],
        },
      ],
      amount: {
        [primaryTokenId]: '1626373838' as Balance.Quantity,
        ['6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.' as TokenId]:
          '2' as Balance.Quantity,
      },
      fee: undefined,
      delta: {
        [primaryTokenId]: '1407406' as Balance.Quantity,
        ['6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.' as TokenId]:
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
          identifier:
            '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
          policyId:
            '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as PolicyId,
          assetName: '' as AssetName,
          numberOfDecimals: 0,
          ticker: null,
          longName: null,
        },
      },
      memo: null,
      metadata: {},
    },
  },
  {
    key: '5e7eff1b687f538066ea08938e91ba562c88dc817782816a1fc6f1560d8905e8',
    data: {
      id: '5e7eff1b687f538066ea08938e91ba562c88dc817782816a1fc6f1560d8905e8' as TransactionHash,
      inputs: [
        {
          address:
            'addr_test1qqtrcd6qlxy8m30le0e044nj5nesvc322jzjjsv29zxdfpqxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flknsef5gyw' as Address,
          amount: '481040108' as Amount,
          assets: [
            {
              identifier:
                '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
              amount: new BigNumber('1654170'),
            },
          ],
        },
      ],
      outputs: [
        {
          address:
            'addr_test1qrpqpz326zuufgk3u7sygxls2wl0ec9zrappl6zyf0n2v9r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qezrvwq' as Address,
          amount: '1407406' as Amount,
          assets: [
            {
              identifier:
                '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
              amount: new BigNumber('1654170'),
            },
          ],
        },
        {
          address:
            'addr_test1qq022ftqww7e0kwz4mc2n3aaa78hvh7lytn9v6e0wtfllfcxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flkns5a8lc9' as Address,
          amount: '479460117' as Amount,
          assets: [
            {
              identifier:
                '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
              amount: new BigNumber('1654170'),
            },
          ],
        },
      ],
      amount: {
        [primaryTokenId]: '2727272727' as Balance.Quantity,
        ['6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.' as TokenId]:
          '2' as Balance.Quantity,
      },
      fee: undefined,
      delta: {
        [primaryTokenId]: '1407406' as Balance.Quantity,
        ['6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.' as TokenId]:
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
          identifier:
            '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
          policyId:
            '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as PolicyId,
          assetName: '' as AssetName,
          numberOfDecimals: 0,
          ticker: null,
          longName: null,
        },
      },
      memo: null,
      metadata: {},
    },
  },
  {
    key: '0953a5e90889ed0b2ea1e3230cccde871d90c17868aea22300716ecaeec93096',
    data: {
      id: '0953a5e90889ed0b2ea1e3230cccde871d90c17868aea22300716ecaeec93096',
      inputs: [
        {
          address:
            'addr_test1qqtrcd6qlxy8m30le0e044nj5nesvc322jzjjsv29zxdfpqxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flknsef5gyw' as Address,
          amount: '481040108' as Amount,
          assets: [
            {
              identifier:
                '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
              amount: new BigNumber('1407406'),
            },
          ],
        },
      ],
      outputs: [
        {
          address:
            'addr_test1qrpqpz326zuufgk3u7sygxls2wl0ec9zrappl6zyf0n2v9r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qezrvwq' as Address,
          amount: '1407406' as Amount,
          assets: [
            {
              identifier:
                '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
              amount: new BigNumber('1407406'),
            },
          ],
        },
        {
          address:
            'addr_test1qq022ftqww7e0kwz4mc2n3aaa78hvh7lytn9v6e0wtfllfcxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flkns5a8lc9' as Address,
          amount: '479460117' as Amount,
          assets: [
            {
              identifier:
                '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
              amount: new BigNumber('172585'),
            },
          ],
        },
      ],
      amount: {
        [primaryTokenId]: '1407406' as Balance.Quantity,
        ['6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.' as TokenId]:
          '2' as Balance.Quantity,
      },
      fee: undefined,
      delta: {
        [primaryTokenId]: '1407406' as Balance.Quantity,
        ['6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.' as TokenId]:
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
          identifier:
            '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
          policyId:
            '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as PolicyId,
          assetName: '' as AssetName,
          numberOfDecimals: 0,
          ticker: null,
          longName: null,
        },
      },
      memo: null,
      metadata: {},
    },
  },
]

export const mockTransactionInfos = Object.fromEntries(
  rawMockTransactionInfos.map(({key, data}) => [
    key,
    createMockTransactionInfo(data),
  ]),
) satisfies Record<string, TransactionInfo>

export const mockTransactionInfo = (
  transaction?: Partial<TransactionInfo>,
): TransactionInfo => {
  return {
    id: 'ef147cbd5ccb0b0907a2969a697aeb06117ac83f284ddfae53a4198b03719b52' as TransactionHash,
    inputs: [
      {
        address:
          'addr_test1qqtrcd6qlxy8m30le0e044nj5nesvc322jzjjsv29zxdfpqxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flknsef5gyw' as Address,
        amount: '481040108' as Amount,
        assets: [
          {
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
            amount: new BigNumber('1407406'),
          },
        ],
      },
    ],
    outputs: [
      {
        address:
          'addr_test1qrpqpz326zuufgk3u7sygxls2wl0ec9zrappl6zyf0n2v9r2g903x9u62zuk8tae8u5357kzj5f667ztj2xkx7kwse2qezrvwq' as Address,
        amount: '1407406' as Amount,
        assets: [
          {
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
            amount: new BigNumber('1407406'),
          },
        ],
      },
      {
        address:
          'addr_test1qq022ftqww7e0kwz4mc2n3aaa78hvh7lytn9v6e0wtfllfcxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flkns5a8lc9' as Address,
        amount: '479460117' as Amount,
        assets: [
          {
            identifier:
              '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
            amount: new BigNumber('172585'),
          },
        ],
      },
    ],
    amount: {
      [primaryTokenId]: '1407406' as Balance.Quantity,
      ['6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.' as TokenId]:
        '2' as Balance.Quantity,
    },
    fee: undefined,
    delta: {
      [primaryTokenId]: '1407406' as Balance.Quantity,
      ['6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.' as TokenId]:
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
        identifier:
          '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as TokenId,
        policyId:
          '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7' as PolicyId,
        assetName: '' as AssetName,
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
