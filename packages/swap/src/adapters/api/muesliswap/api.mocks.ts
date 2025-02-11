import {Portfolio, Swap} from '@yoroi/types'

import {OrdersHistoryResponse, TokensResponse} from './types'

const ordersResponse: OrdersHistoryResponse = {
  orders: [
    {
      dex: 'sundaeswap-v1',
      aggregator: null,
      fromToken: '.',
      toToken:
        '4cb48d60d1f7823d1307c61b9ecf472ff78cf22d1ccc5786d59461f8.4144414d4f4f4e',
      fromAmount: '0.000036',
      toAmount: '10',
      paidAmount: '0.000036',
      receivedAmount: '11',
      batcherFee: '2.500000',
      attachedValues: [
        {
          amount: 4500036,
          token: '.',
        },
      ],
      sender:
        'addr1q9r502tqdksvqmhs3lwlxx5f5cz0c92cftqqludl3r0urtk0ppwv8x4ylafdu84xqmh9sx4vrk4czekksv884xmvanwql6sl74',
      beneficiary:
        'addr1q9r502tqdksvqmhs3lwlxx5f5cz0c92cftqqludl3r0urtk0ppwv8x4ylafdu84xqmh9sx4vrk4czekksv884xmvanwql6sl74',
      txHash:
        '29f51a2a9e46ced05f03abc9b419ae57164dc056534121f041d69e307b9722f8',
      outputIdx: 0,
      deposit: '2.000000',
      status: 'matched',
      placedAt: 1722503907,
      finalizedAt: 1722503915,
      finalizedTxHash:
        '8d3b20bafb8378366f819f506da327a43e94d6948c002bac00a9b1de401bc571',
      providerSpecifics: {
        poolId: '1701',
        swapDirection: 0,
      },
    },
    {
      dex: 'minswap-v2',
      aggregator: null,
      fromToken: '.',
      toToken:
        '49e423161ef818adc475c783571cb479d5f15ad52a01a240eacc0d3b.434f434b',
      fromAmount: '0.008137',
      toAmount: '1',
      paidAmount: '0.000000',
      receivedAmount: '0',
      batcherFee: '2.000000',
      attachedValues: [
        {
          amount: 4008137,
          token: '.',
        },
      ],
      sender:
        'addr1q9r502tqdksvqmhs3lwlxx5f5cz0c92cftqqludl3r0urtk0ppwv8x4ylafdu84xqmh9sx4vrk4czekksv884xmvanwql6sl74',
      beneficiary:
        'addr1q9r502tqdksvqmhs3lwlxx5f5cz0c92cftqqludl3r0urtk0ppwv8x4ylafdu84xqmh9sx4vrk4czekksv884xmvanwql6sl74',
      txHash:
        '475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf',
      outputIdx: 0,
      deposit: '2.000000',
      status: 'canceled',
      placedAt: 1737538157,
      finalizedAt: 1737538235,
      finalizedTxHash:
        '37b729b5e823df5e42826257c3ecab1b0bc05e73258eb614000c1338faef9a1d',
      providerSpecifics: null,
    },
  ],
  numbers_have_decimals: true,
}

const tokensResponse: TokensResponse = [
  {
    ticker: 'ADA',
    name: null,
    policyId: '',
    hexName: '',
    decimals: 6,
    verified: true,
  },
  {
    ticker: 'PTC',
    name: 'Pocket Change',
    policyId: '007394e3117755fbb0558b93c54ce3bc6c85770920044ade143dc742',
    hexName: '505443',
    decimals: 0,
    verified: false,
  },
  {
    ticker: 'BTN',
    name: 'BTN',
    policyId: '016be5325fd988fea98ad422fcfd53e5352cacfced5c106a932a35a4',
    hexName: '42544e',
    decimals: 6,
    verified: true,
  },
]

export const primaryTokenInfo: Portfolio.Token.Info = {
  id: '.',
  type: Portfolio.Token.Type.FT,
  nature: Portfolio.Token.Nature.Primary,
  decimals: 6,
  ticker: 'ADA',
  name: 'Cardano',
  symbol: 'ADA',
  status: Portfolio.Token.Status.Valid,
  application: Portfolio.Token.Application.Coin,
  tag: '',
  reference: '',
  fingerprint: '',
  description: '',
  website: '',
  originalImage: '',
}

const ordersResult: Array<Swap.Order> = [
  {
    actualAmountOut: 11,
    aggregator: 'muesliswap',
    amountIn: 0.000036,
    expectedAmountOut: 10,
    lastUpdate: 1722503915000,
    outputIndex: 0,
    placedAt: 1722503907000,
    protocol: 'sundaeswap-v1',
    status: 'matched',
    tokenIn: '.',
    tokenOut:
      '4cb48d60d1f7823d1307c61b9ecf472ff78cf22d1ccc5786d59461f8.4144414d4f4f4e',
    txHash: '29f51a2a9e46ced05f03abc9b419ae57164dc056534121f041d69e307b9722f8',
    updateTxHash:
      '8d3b20bafb8378366f819f506da327a43e94d6948c002bac00a9b1de401bc571',
  },
  {
    actualAmountOut: 0,
    aggregator: 'muesliswap',
    amountIn: 0.008137,
    expectedAmountOut: 1,
    lastUpdate: 1737538235000,
    outputIndex: 0,
    placedAt: 1737538157000,
    protocol: 'minswap-v2',
    status: 'canceled',
    tokenIn: '.',
    tokenOut:
      '49e423161ef818adc475c783571cb479d5f15ad52a01a240eacc0d3b.434f434b',
    txHash: '475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf',
    updateTxHash:
      '37b729b5e823df5e42826257c3ecab1b0bc05e73258eb614000c1338faef9a1d',
  },
]

const tokensResult: Array<Portfolio.Token.Info> = [
  primaryTokenInfo,
  {
    application: Portfolio.Token.Application.General,
    decimals: 0,
    description: '',
    fingerprint: '',
    id: '007394e3117755fbb0558b93c54ce3bc6c85770920044ade143dc742.505443',
    name: 'Pocket Change',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: '',
    reference: '',
    status: Portfolio.Token.Status.Invalid,
    symbol: '',
    tag: '',
    ticker: 'PTC',
    type: Portfolio.Token.Type.FT,
    website: '',
  },
  {
    application: Portfolio.Token.Application.General,
    decimals: 6,
    description: '',
    fingerprint: '',
    id: '016be5325fd988fea98ad422fcfd53e5352cacfced5c106a932a35a4.42544e',
    name: 'BTN',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: '',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'BTN',
    type: Portfolio.Token.Type.FT,
    website: '',
  },
]

export const api = {
  responses: {
    tokens: tokensResponse,
    orders: ordersResponse,
  },
  results: {
    tokens: tokensResult,
    orders: ordersResult,
  },
}
