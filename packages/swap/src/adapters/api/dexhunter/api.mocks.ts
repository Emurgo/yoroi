import {Portfolio, Swap} from '@yoroi/types'

import {
  BuildRequest,
  BuildResponse,
  CancelRequest,
  CancelResponse,
  EstimateRequest,
  EstimateResponse,
  LimitBuildRequest,
  LimitBuildResponse,
  LimitEstimateRequest,
  LimitEstimateResponse,
  OrdersResponse,
  ReverseEstimateRequest,
  ReverseEstimateResponse,
  SignRequest,
  SignResponse,
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
    is_dexhunter: true,
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
    status: 'matched',
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
    status: 'matched',
    tokenIn:
      '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e.776f726c646d6f62696c65746f6b656e',
    tokenOut: '.',
    txHash: 'f7826e21a464939b64274b00033d7ddebbc90924260d30530fdf7a8cd2824d51',
    updateTxHash:
      'a8b77336d8600f1c8dac0ed90d0ab9c4f1e815bb25f4e168aaaadd130f81457d',
  },
  {
    actualAmountOut: 0,
    aggregator: 'dexhunter',
    amountIn: -0.04999999999999982,
    customId: '66cf53aa94579f05fceb90f4',
    expectedAmountOut: 1.889324,
    lastUpdate: 1697122968000,
    outputIndex: 0,
    placedAt: 1697122968000,
    protocol: 'vyfi-v1',
    status: 'canceled',
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
    aggregator: 'dexhunter',
    amountIn: 1,
    customId: '66cf043794579f05fc204f72',
    expectedAmountOut: 0.000368,
    lastUpdate: 1719137534000,
    outputIndex: 0,
    placedAt: 1719137466000,
    protocol: 'sundaeswap-v1',
    status: 'matched',
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

const limitEstimateInput: Swap.EstimateRequest = {
  tokenIn: '.',
  tokenOut: 'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
  amountIn: 38,
  protocol: 'minswap-v1',
  blockedProtocols: ['wingriders-v1'],
  amountOut: undefined,
  multiples: 1,
  wantedPrice: 1,
  slippage: 0,
}

const limitEstimateRequest: LimitEstimateRequest = {
  amount_in: 38,
  blacklisted_dexes: ['WINGRIDER'],
  dex: 'MINSWAP',
  multiples: 1,
  token_in: 'ADA',
  token_out: 'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950',
  wanted_price: 1,
}

const limitEstimateResponse: LimitEstimateResponse = {
  splits: [
    {
      amount_in: 9223372036854.775,
      expected_output: 9223372036854.775,
      expected_output_without_slippage: 9223372036854.775,
      fee: 4,
      dex: 'VYFI',
      price_impact: 874011.5392608035,
      initial_price: 0.00011440337320702896,
      final_price: 1.0000130865062424,
      pool_id:
        '000000000000000000000000000000000000000000000000000000006c6f76656c616365af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950VYFIaddr1wx6vzxyapfw4f4ragkvqtk3y473wj4sul3fr98xhguvazlse88lan',
      batcher_fee: 2,
      deposits: 2,
      price_distortion: 871389.201643021,
      pool_fee: 0.003,
    },
  ],
  total_fee: 4,
  total_output: 9223372036854.775,
  deposits: 2,
  batcher_fee: 2,
  total_input: 1000000000000000,
  possible_routes: {},
  net_price: 1,
  dexhunter_fee: 1,
  blacklisted_dexes: null,
  partner: '',
  partner_fee: 0,
}

const limitEstimateResult: Swap.EstimateResponse = {
  aggregatorFee: 1,
  batcherFee: 2,
  deposits: 2,
  frontendFee: 0,
  netPrice: 1,
  priceImpact: 874011.5392608035,
  splits: [
    {
      amountIn: 9223372036854.775,
      batcherFee: 2,
      deposits: 2,
      expectedOutput: 9223372036854.775,
      expectedOutputWithoutSlippage: 9223372036854.775,
      fee: 4,
      finalPrice: 1.0000130865062424,
      initialPrice: 0.00011440337320702896,
      poolFee: 0.003,
      poolId:
        '000000000000000000000000000000000000000000000000000000006c6f76656c616365af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950VYFIaddr1wx6vzxyapfw4f4ragkvqtk3y473wj4sul3fr98xhguvazlse88lan',
      priceDistortion: 871389.201643021,
      priceImpact: 874011.5392608035,
      protocol: 'vyfi-v1',
    },
  ],
  totalFee: 3,
  totalInput: 1000000000000000,
  totalOutput: 9223372036854.775,
  totalOutputWithoutSlippage: 9223372036854.775,
}

const reverseEstimateInput: Swap.EstimateRequest = {
  slippage: 5,
  tokenIn: '.',
  tokenOut: 'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
  amountOut: 38,
  protocol: 'minswap-v1',
  blockedProtocols: ['wingriders-v1'],
}

const reverseEstimateRequest: ReverseEstimateRequest = {
  slippage: reverseEstimateInput.slippage,
  amount_out: reverseEstimateInput.amountOut,
  // TODO: @jorbuedo ADA x ptIdDh
  token_in: 'ADA',
  token_out: 'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950',
  blacklisted_dexes: ['WINGRIDER'],
}

const reverseEstimateResponse: ReverseEstimateResponse = {
  splits: [
    {
      amount_in: 0.004559,
      expected_output: 35.288684,
      expected_output_without_slippage: 37.145984,
      fee: 4,
      dex: 'MINSWAP',
      price_impact: 0.0013874760358920197,
      initial_price: 0.00012238115855095046,
      final_price: 0.0001223828565601978,
      pool_id:
        '000000000000000000000000000000000000000000000000000000006c6f76656c616365af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950MINSWAPc1245066d133f864ff9220aabb1388bb801986e6da6754b8234ce8fc3c6029f6',
      batcher_fee: 2,
      deposits: 2,
      price_distortion: 0.30161668639221895,
      pool_fee: 0.003,
    },
  ],
  total_fee: 4,
  total_output: 35.288684,
  deposits: 2,
  possible_routes: {},
  dexhunter_fee: 1.000004,
  batcher_fee: 2,
  total_input: 0.0045599187141238265,
  total_input_without_slippage: 0.0045599187141238265,
  net_price: 0.008146194335645627,
  net_price_reverse: 122.75670807707843,
}

const reverseEstimateResult: Swap.EstimateResponse = {
  aggregatorFee: 1.000004,
  batcherFee: 2,
  deposits: 2,
  frontendFee: 0,
  netPrice: 0.008146194335645627,
  priceImpact: 0.0013874760358920197,
  splits: [
    {
      amountIn: 0.004559,
      batcherFee: 2,
      deposits: 2,
      expectedOutput: 35.288684,
      expectedOutputWithoutSlippage: 37.145984,
      fee: 4,
      finalPrice: 0.0001223828565601978,
      initialPrice: 0.00012238115855095046,
      poolFee: 0.003,
      poolId:
        '000000000000000000000000000000000000000000000000000000006c6f76656c616365af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950MINSWAPc1245066d133f864ff9220aabb1388bb801986e6da6754b8234ce8fc3c6029f6',
      priceDistortion: 0.30161668639221895,
      priceImpact: 0.0013874760358920197,
      protocol: 'minswap-v1',
    },
  ],
  totalFee: 3.000004,
  totalInput: 0.0045599187141238265,
  totalOutput: 35.288684,
  totalOutputWithoutSlippage: 35.288684,
}

const estimateInput: Swap.EstimateRequest = {
  slippage: 0.01,
  tokenIn: '.',
  tokenOut: 'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
  amountIn: 10,
  amountOut: undefined,
  protocol: 'minswap-v1',
  blockedProtocols: ['wingriders-v1'],
  multiples: 1,
  wantedPrice: undefined,
}

const estimateRequest: EstimateRequest = {
  amount_in: estimateInput.amountIn,
  slippage: estimateInput.slippage,
  // TODO: @jorbuedo ADA x ptIdDh
  token_in: 'ADA',
  token_out: 'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950',
  blacklisted_dexes: ['WINGRIDER'],
}

const estimateResponse: EstimateResponse = {
  splits: [
    {
      amount_in: 9223372036854.775,
      expected_output: 9223372036854.775,
      expected_output_without_slippage: 9223372036854.775,
      fee: 4,
      dex: 'VYFI',
      price_impact: 843546.4933049141,
      initial_price: 0.00011853462095991185,
      final_price: 1.0000131730805681,
      pool_id:
        '000000000000000000000000000000000000000000000000000000006c6f76656c616365af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950VYFIaddr1wx6vzxyapfw4f4ragkvqtk3y473wj4sul3fr98xhguvazlse88lan',
      batcher_fee: 2,
      deposits: 2,
      price_distortion: 841015.5508249996,
      pool_fee: 0.003,
    },
  ],
  total_fee: 4,
  total_output: 0,
  deposits: 2,
  batcher_fee: 2,
  total_input: 1000000000000000,
  possible_routes: {},
  net_price: 0,
  dexhunter_fee: 1,
  blacklisted_dexes: null,
  partner: '',
  partner_fee: 0,
}

const estimateResult: Swap.EstimateResponse = {
  aggregatorFee: 1,
  batcherFee: 2,
  deposits: 2,
  frontendFee: 0,
  netPrice: 0,
  priceImpact: 843546.4933049141,
  splits: [
    {
      amountIn: 9223372036854.775,
      batcherFee: 2,
      deposits: 2,
      expectedOutput: 9223372036854.775,
      expectedOutputWithoutSlippage: 9223372036854.775,
      fee: 4,
      finalPrice: 1.0000131730805681,
      initialPrice: 0.00011853462095991185,
      poolFee: 0.003,
      poolId:
        '000000000000000000000000000000000000000000000000000000006c6f76656c616365af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950VYFIaddr1wx6vzxyapfw4f4ragkvqtk3y473wj4sul3fr98xhguvazlse88lan',
      priceDistortion: 841015.5508249996,
      priceImpact: 843546.4933049141,
      protocol: 'vyfi-v1',
    },
  ],
  totalFee: 3,
  totalInput: 9223372036854.775,
  totalOutput: 0,
  totalOutputWithoutSlippage: 0,
}

const quoteInput: Swap.EstimateRequest = {
  slippage: 0.01,
  tokenIn: '.',
  tokenOut: 'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
  amountIn: 10,
  amountOut: undefined,
  protocol: 'minswap-v1',
  blockedProtocols: ['wingriders-v1'],
  multiples: 1,
  wantedPrice: undefined,
}

const createResult: Swap.CreateResponse = {
  aggregator: 'muesliswap',
  aggregatorFee: 0,
  batcherFee: 2,
  cbor: '84a500838258203976997901257e283cc9da856b9e50174c4eb9dfd8ce55b5be9fbe2f9289577500825820475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf03825820e22c3b1fd8e77643612bb2611e8fb74238ba540867dd9d4ecaec1590c613566400018283583911a65ca58a4e9c755fa830173d2a5caed458ac0c73f97db7faae2e7e3b52563c5410bff6a0d43ccebb7c37e1f69f5eb260552521adff33b9c21a004c4b40582079aaea3504c39973f6bd387a2250e3553220722f429ffddbf6dae7f3c7bfb61c825839014747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aecf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdc821a005a5946ac581c2441ab3351c3b80213a98f4e09ddcf7dabe4879c3c94cc4e7205cb63a144464952451909e3581c279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3fa144534e454b18cc581c4cb48d60d1f7823d1307c61b9ecf472ff78cf22d1ccc5786d59461f8a1474144414d4f4f4e1a004c3d2e581c8654e8b350e298c80d2451beb5ed80fc9eee9f38ce6b039fb8706bc3a1474c4f42535445521a0010f66f581ca0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235a145484f534b591a06e8f5c4581cafbe91c0b44b3040e360057bf8354ead8c49c4979ae6ab7c4fbdc9eba1464d494c4b76321a00424fe1581cb788fbee71a32d2efc5ee7d151f3917d99160f78fb1e41a1bbf80d8fa1494c454146544f4b454e1b0000000536f5613f581cc5609c4800c05e82c4219ccf14c7fdf5212e11f83dbbb57ac716e98ea145666c756666186f581cc898c986b97e7ac5b33e999bc11b054a9987f48ec4459f8c1ea0c32ba148435245414d5049451a06a21941581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48aa144434153541911bd581ce0c4c2d7c4a0ed2cf786753fd845dee82c45512cee03e92adfd3fb8da14d6a6176696275656e6f2e61646101581cf0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9aa14d000de1406a6176696275656e6f01021a0003388d0758203ee91922e55ac83b91cdce3d7aa8fb01085e26622a6da92bad3908c29cbffca00b582067cbc9782dbb59e371f3dbc4eeba0b20cdeb91e1b7f53efaccd58f78975a50fba10481d8799fd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd87a80d8799fd8799f581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a4443415354ff19046aff1a001e84801a001e8480fff5a11902a2783b7b276d7367273a205b274d7565736c69537761702041676772656761746f7220506c61636520437573746f6d204c696d6974204f72646572275d7d',
  deposits: 2,
  frontendFee: 0,
  netPrice: 1130,
  priceImpact: 1.258404559451805,
  splits: [
    {
      amountIn: 1,
      batcherFee: 2,
      deposits: 2,
      expectedOutput: 1130,
      expectedOutputWithoutSlippage: 1130,
      fee: 0.3,
      finalPrice: 0.041994,
      initialPrice: 0.04252918925670425,
      poolFee: 0.3,
      poolId:
        '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
      priceDistortion: 1.258404559451805,
      priceImpact: 1.258404559451805,
      protocol: 'minswap-v1',
    },
  ],
  totalFee: 4,
  totalInput: 1,
  totalOutput: 1130,
  totalOutputWithoutSlippage: 1130,
}

const createInput: Array<Swap.CreateRequest> = [
  {
    tokenOut:
      'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354',
    tokenIn: '.',
    amountIn: 1,
  },
  {
    tokenOut:
      'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354',
    tokenIn: '.',
    amountIn: 1,
    protocol: 'minswap-v1',
    slippage: 2,
  },
  {
    wantedPrice: 1,
    amountIn: 0,
    tokenIn: `13244.10130193`,
    tokenOut: `.`,
  },
]

const limitBuildRequest: LimitBuildRequest = {
  amount_in: 1,
  blacklisted_dexes: undefined,
  buyer_address:
    'addr1q9qhyvkm5fytm5ckgshny0zz08a3urhhh7ckdqxcm27av40eafn3v5lr2w2n2er9uj7c743mt42gpe8tgek6394z9t7qn4yjzl',
  dex: undefined,
  multiples: undefined,
  token_in: 'ADA',
  token_out: 'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a43415354',
  wanted_price: undefined,
}

const limitBuildResponse: LimitBuildResponse = {
  cbor: '84a500838258203976997901257e283cc9da856b9e50174c4eb9dfd8ce55b5be9fbe2f9289577500825820475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf03825820e22c3b1fd8e77643612bb2611e8fb74238ba540867dd9d4ecaec1590c613566400018283583911a65ca58a4e9c755fa830173d2a5caed458ac0c73f97db7faae2e7e3b52563c5410bff6a0d43ccebb7c37e1f69f5eb260552521adff33b9c21a004c4b40582079aaea3504c39973f6bd387a2250e3553220722f429ffddbf6dae7f3c7bfb61c825839014747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aecf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdc821a005a5946ac581c2441ab3351c3b80213a98f4e09ddcf7dabe4879c3c94cc4e7205cb63a144464952451909e3581c279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3fa144534e454b18cc581c4cb48d60d1f7823d1307c61b9ecf472ff78cf22d1ccc5786d59461f8a1474144414d4f4f4e1a004c3d2e581c8654e8b350e298c80d2451beb5ed80fc9eee9f38ce6b039fb8706bc3a1474c4f42535445521a0010f66f581ca0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235a145484f534b591a06e8f5c4581cafbe91c0b44b3040e360057bf8354ead8c49c4979ae6ab7c4fbdc9eba1464d494c4b76321a00424fe1581cb788fbee71a32d2efc5ee7d151f3917d99160f78fb1e41a1bbf80d8fa1494c454146544f4b454e1b0000000536f5613f581cc5609c4800c05e82c4219ccf14c7fdf5212e11f83dbbb57ac716e98ea145666c756666186f581cc898c986b97e7ac5b33e999bc11b054a9987f48ec4459f8c1ea0c32ba148435245414d5049451a06a21941581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48aa144434153541911bd581ce0c4c2d7c4a0ed2cf786753fd845dee82c45512cee03e92adfd3fb8da14d6a6176696275656e6f2e61646101581cf0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9aa14d000de1406a6176696275656e6f01021a0003388d0758203ee91922e55ac83b91cdce3d7aa8fb01085e26622a6da92bad3908c29cbffca00b582067cbc9782dbb59e371f3dbc4eeba0b20cdeb91e1b7f53efaccd58f78975a50fba10481d8799fd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd87a80d8799fd8799f581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a4443415354ff19046aff1a001e84801a001e8480fff5a11902a2783b7b276d7367273a205b274d7565736c69537761702041676772656761746f7220506c61636520437573746f6d204c696d6974204f72646572275d7d',
  deposits: 2,
  splits: [
    {
      amount_in: 1,
      batcher_fee: 2,
      deposits: 2,
      expected_output: 1130,
      expected_output_without_slippage: 1130,
      fee: 0.3,
      final_price: 0.041994,
      initial_price: 0.04252918925670425,
      pool_fee: 0.3,
      pool_id:
        '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
      price_distortion: 1.258404559451805,
      price_impact: 1.258404559451805,
      dex: 'MINSWAP',
    },
  ],
  totalFee: 4,
}

const buildRequest: BuildRequest = {
  amount_in: 1,
  blacklisted_dexes: undefined,
  buyer_address:
    'addr1q9qhyvkm5fytm5ckgshny0zz08a3urhhh7ckdqxcm27av40eafn3v5lr2w2n2er9uj7c743mt42gpe8tgek6394z9t7qn4yjzl',
  slippage: 2,
  token_in: 'ADA',
  token_out: 'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a43415354',
}

const buildResponse: BuildResponse = {
  average_price: 1.234,
  batcher_fee: 0.001,
  cbor: 'a1b2c3d4e5f6',
  communications: ['Success', 'Transaction confirmed'],
  deposits: 1000,
  dexhunter_fee: 0.002,
  net_price: 1.23,
  net_price_reverse: 0.812,
  partner_code: 'PartnerX',
  partner_fee: 0.003,
  possible_routes: {
    route1: 0.5,
    route2: 0.3,
    route3: 0.2,
  },
  splits: [
    {
      amount_in: 1,
      batcher_fee: 2,
      deposits: 2,
      expected_output: 1130,
      expected_output_without_slippage: 1130,
      fee: 0.3,
      final_price: 0.041994,
      initial_price: 0.04252918925670425,
      pool_fee: 0.3,
      pool_id:
        '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
      price_distortion: 1.258404559451805,
      price_impact: 1.258404559451805,
      dex: 'MINSWAP',
    },
  ],
  total_fee: 0.003,
  total_input: 500,
  total_input_without_slippage: 505,
  total_output: 495,
  total_output_without_slippage: 500,
}

const signRequest: SignRequest = {
  Signatures: '3045022100a3b1c2d3e4f5',
  txCbor: 'a1b2c3d4e5f6',
}
const signResponse: SignResponse = {
  cbor: '3045022100a3b1c2d3e4f5',
  strat_id: 'a1b2c3d4e5f6',
}

export const api = {
  inputs: {
    cancel: cancelInput,
    estimate: estimateInput,
    quote: quoteInput,
    create: createInput,
    reverseEstimate: reverseEstimateInput,
    limitEstimate: limitEstimateInput,
  },
  requests: {
    cancel: cancelRequest,
    estimate: estimateRequest,
    reverseEstimate: reverseEstimateRequest,
    limitEstimate: limitEstimateRequest,
    limitBuild: limitBuildRequest,
    build: buildRequest,
    sign: signRequest,
  },
  responses: {
    tokens: tokensResponse,
    orders: ordersResponse,
    cancel: cancelResponse,
    estimate: estimateResponse,
    reverseEstimate: reverseEstimateResponse,
    limitEstimate: limitEstimateResponse,
    limitBuild: limitBuildResponse,
    build: buildResponse,
    sign: signResponse,
  },
  results: {
    tokens: tokensResult,
    orders: ordersResult,
    cancel: cancelResult,
    estimate: estimateResult,
    reverseEstimate: reverseEstimateResult,
    limitEstimate: limitEstimateResult,
    create: createResult,
  },
}
