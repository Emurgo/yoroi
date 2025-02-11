import {Portfolio, Swap} from '@yoroi/types'

import {
  CancelRequest,
  CancelResponse,
  OrdersResponse,
  TokensResponse,
} from './types'

const ordersResponse: OrdersResponse = [
  {
    _id: '66cf043794579f05fc204f72',
    token_id_in:
      'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950',
    token_id_out:
      '000000000000000000000000000000000000000000000000000000006c6f76656c616365',
    dex: 'SUNDAESWAP',
    status: 'COMPLETE',
    user_address:
      'addr1q9qhyvkm5fytm5ckgshny0zz08a3urhhh7ckdqxcm27av40eafn3v5lr2w2n2er9uj7c743mt42gpe8tgek6394z9t7qn4yjzl',
    user_stake: 'stake1u8u75eck203489f4v3j7f0v02ca464yqun45vmdgj63z4lqm9pu9k',
    amount_in: 1,
    expected_out_amount: 0.000368,
    actual_out_amount: 0.00037900000000012923,
    is_dexhunter: false,
    submission_time: '2024-06-23T10:11:06Z',
    last_update: '2024-06-23T10:12:14Z',
    tx_hash: '8751fbef1ebec0d2da9218a69493ef36070012ce24fdbc44ec6df519377b92bf',
    output_index: 0,
    update_tx_hash:
      '92bd050ec1da6d25abf6265a6f8318a79a3068459254a79427088407c4241b37',
    is_stop_loss: false,
    is_oor: false,
    batcher_fee: 2.5,
    deposit: 2,
  },
  {
    _id: '66d0e36894579f05fc822e6e',
    token_id_in:
      '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e776f726c646d6f62696c65746f6b656e',
    token_id_out:
      '000000000000000000000000000000000000000000000000000000006c6f76656c616365',
    dex: 'MUESLISWAP',
    status: 'COMPLETE',
    user_address:
      'addr1q9qhyvkm5fytm5ckgshny0zz08a3urhhh7ckdqxcm27av40eafn3v5lr2w2n2er9uj7c743mt42gpe8tgek6394z9t7qn4yjzl',
    user_stake: 'stake1u8u75eck203489f4v3j7f0v02ca464yqun45vmdgj63z4lqm9pu9k',
    amount_in: 15.330409,
    expected_out_amount: 3.756354,
    actual_out_amount: 5.801912,
    is_dexhunter: false,
    submission_time: '2023-12-16T14:16:37Z',
    last_update: '2023-12-16T14:16:56Z',
    tx_hash: 'f7826e21a464939b64274b00033d7ddebbc90924260d30530fdf7a8cd2824d51',
    output_index: 0,
    update_tx_hash:
      'a8b77336d8600f1c8dac0ed90d0ab9c4f1e815bb25f4e168aaaadd130f81457d',
    is_stop_loss: false,
    is_oor: false,
    batcher_fee: 1.15,
    deposit: 1,
  },
  {
    _id: '66cf53aa94579f05fceb90f4',
    token_id_in:
      '000000000000000000000000000000000000000000000000000000006c6f76656c616365',
    token_id_out:
      '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e776f726c646d6f62696c65746f6b656e',
    dex: 'VYFI',
    status: 'CANCELLED',
    user_address:
      'addr1q9qhyvkm5fytm5ckgshny0zz08a3urhhh7ckdqxcm27av40eafn3v5lr2w2n2er9uj7c743mt42gpe8tgek6394z9t7qn4yjzl',
    user_stake: 'stake1u8u75eck203489f4v3j7f0v02ca464yqun45vmdgj63z4lqm9pu9k',
    amount_in: -0.04999999999999982,
    expected_out_amount: 1.889324,
    actual_out_amount: 0,
    is_dexhunter: false,
    submission_time: '2023-10-12T15:02:48Z',
    last_update: '2023-10-12T15:02:48Z',
    tx_hash: '8956d68753d718afbaafde0e83dc1cb1d205da3c89fb08c924ab1d63fd953ed2',
    output_index: 0,
    update_tx_hash:
      '6f176b9e1cdbcecafc6c3d80735ec031b125eca19f9bccb57a0a96604e4f539a',
    is_stop_loss: false,
    is_oor: false,
    batcher_fee: 2,
    deposit: 2,
  },
]

const tokensResponse: TokensResponse = [
  {
    token_id:
      '885742cd7e0dad321622b5d3ad186797bd50c44cbde8b48be1583fbd534b554c4c',
    token_decimals: 0,
    token_policy: '885742cd7e0dad321622b5d3ad186797bd50c44cbde8b48be1583fbd',
    token_ascii: 'SKULL',
    ticker: 'SKULL',
    is_verified: false,
    supply: 1_000,
    creation_date: '0001-01-01T00:00:00Z',
    price: 0,
  },
  {
    token_id:
      '8d7cc34c1a44ef419cf1560cbb84e7720ca6c03ab99f8745ab61d19d50414e4441',
    token_decimals: 0,
    token_policy: '8d7cc34c1a44ef419cf1560cbb84e7720ca6c03ab99f8745ab61d19d',
    token_ascii: 'PANDA Token',
    ticker: 'PANDA',
    is_verified: true,
    supply: 0,
    creation_date: '0001-01-01T00:00:00Z',
    price: 0,
  },
  {
    token_id:
      '000000000000000000000000000000000000000000000000000000006c6f76656c616365',
    token_decimals: 6,
    token_policy: '00000000000000000000000000000000000000000000000000000000',
    token_ascii: 'ADA',
    ticker: 'ADA',
    is_verified: true,
    supply: 45_000_000_000,
    creation_date: '0001-01-01T00:00:00Z',
    price: 0,
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
    actualAmountOut: 0.00037900000000012923,
    aggregator: 'muesliswap',
    amountIn: 1,
    customId: '66cf043794579f05fc204f72',
    expectedAmountOut: 0.000368,
    lastUpdate: 1719137534000,
    outputIndex: 0,
    placedAt: 1719137466000,
    protocol: 'sundaeswap-v1',
    status: 'COMPLETE',
    tokenIn:
      'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
    tokenOut: '.',
    txHash: '8751fbef1ebec0d2da9218a69493ef36070012ce24fdbc44ec6df519377b92bf',
    updateTxHash:
      '92bd050ec1da6d25abf6265a6f8318a79a3068459254a79427088407c4241b37',
  },
  {
    actualAmountOut: 5.801912,
    aggregator: 'muesliswap',
    amountIn: 15.330409,
    customId: '66d0e36894579f05fc822e6e',
    expectedAmountOut: 3.756354,
    lastUpdate: 1702736216000,
    outputIndex: 0,
    placedAt: 1702736197000,
    protocol: 'muesliswap-clp',
    status: 'COMPLETE',
    tokenIn:
      '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e.776f726c646d6f62696c65746f6b656e',
    tokenOut: '.',
    txHash: 'f7826e21a464939b64274b00033d7ddebbc90924260d30530fdf7a8cd2824d51',
    updateTxHash:
      'a8b77336d8600f1c8dac0ed90d0ab9c4f1e815bb25f4e168aaaadd130f81457d',
  },
  {
    actualAmountOut: 0,
    aggregator: 'muesliswap',
    amountIn: -0.04999999999999982,
    customId: '66cf53aa94579f05fceb90f4',
    expectedAmountOut: 1.889324,
    lastUpdate: 1697122968000,
    outputIndex: 0,
    placedAt: 1697122968000,
    protocol: 'vyfi-v1',
    status: 'CANCELLED',
    tokenIn: '.',
    tokenOut:
      '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e.776f726c646d6f62696c65746f6b656e',
    txHash: '8956d68753d718afbaafde0e83dc1cb1d205da3c89fb08c924ab1d63fd953ed2',
    updateTxHash:
      '6f176b9e1cdbcecafc6c3d80735ec031b125eca19f9bccb57a0a96604e4f539a',
  },
]

const tokensResult: Array<Portfolio.Token.Info> = [
  {
    application: Portfolio.Token.Application.General,
    decimals: 0,
    description: '',
    fingerprint: '',
    id: '885742cd7e0dad321622b5d3ad186797bd50c44cbde8b48be1583fbd.534b554c4c',
    name: 'SKULL',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: '',
    reference: '',
    status: Portfolio.Token.Status.Invalid,
    symbol: '',
    tag: '',
    ticker: 'SKULL',
    type: Portfolio.Token.Type.FT,
    website: '',
  },
  {
    application: Portfolio.Token.Application.General,
    decimals: 0,
    description: '',
    fingerprint: '',
    id: '8d7cc34c1a44ef419cf1560cbb84e7720ca6c03ab99f8745ab61d19d.50414e4441',
    name: 'PANDA Token',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: '',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'PANDA',
    type: Portfolio.Token.Type.FT,
    website: '',
  },
  {
    application: Portfolio.Token.Application.Coin,
    decimals: 6,
    description: '',
    fingerprint: '',
    id: '.',
    name: 'Cardano',
    nature: Portfolio.Token.Nature.Primary,
    originalImage: '',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: 'ADA',
    tag: '',
    ticker: 'ADA',
    type: Portfolio.Token.Type.FT,
    website: '',
  },
]

const cancelInput: Swap.CancelRequest = {
  order: {
    actualAmountOut: 0.00037900000000012923,
    aggregator: 'muesliswap',
    amountIn: 1,
    customId: '66cf043794579f05fc204f72',
    expectedAmountOut: 0.000368,
    lastUpdate: 1719137534000,
    outputIndex: 0,
    placedAt: 1719137466000,
    protocol: 'sundaeswap-v1',
    status: 'COMPLETE',
    tokenIn:
      'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
    tokenOut: '.',
    txHash: '8751fbef1ebec0d2da9218a69493ef36070012ce24fdbc44ec6df519377b92bf',
    updateTxHash:
      '92bd050ec1da6d25abf6265a6f8318a79a3068459254a79427088407c4241b37',
  },
}

const cancelRequest = (address: string): CancelRequest => ({
  address,
  order_id: cancelInput.order.customId,
})

const cancelResponse: CancelResponse = {
  additional_cancellation_fee: 2_000_000,
  cbor: 'DEADBEEF',
}

const cancelResult: Swap.CancelResponse = {
  cbor: cancelResponse.cbor!,
  additionalCancellationFee: cancelResponse.additional_cancellation_fee,
}

export const api = {
  inputs: {
    cancel: cancelInput,
  },
  requests: {
    cancel: cancelRequest,
  },
  responses: {
    tokens: tokensResponse,
    orders: ordersResponse,
    cancel: cancelResponse,
  },
  results: {
    tokens: tokensResult,
    orders: ordersResult,
    cancel: cancelResult,
  },
}
