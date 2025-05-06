import {Portfolio, Swap} from '@yoroi/types'

import {
  CancelRequest,
  CancelResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  OrdersHistoryResponse,
  QuoteRequest,
  QuoteResponse,
  TokensResponse,
} from './types'

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
      finalizedAt: null,
      finalizedTxHash: null,
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
  // NOTE: when decimals = null is ignored
  {
    ticker: 'NONE',
    name: 'NONE',
    hexName: '4e4f4e45',
    policyId: '016be5325fd988fea98ad422fcfd53e5352cacfced5c106a932a35a5',
    verified: true,
    decimals: null,
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
    outputIndex: 0,
    placedAt: 1737538157000,
    protocol: 'minswap-v2',
    status: 'canceled',
    tokenIn: '.',
    tokenOut:
      '49e423161ef818adc475c783571cb479d5f15ad52a01a240eacc0d3b.434f434b',
    txHash: '475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf',
    updateTxHash:
      '475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf',
    lastUpdate: undefined,
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

const cancelInput: Array<Swap.CancelRequest> = [
  {
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
      status: 'matched',
      tokenIn:
        'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
      tokenOut: '.',
      txHash:
        '8751fbef1ebec0d2da9218a69493ef36070012ce24fdbc44ec6df519377b92bf',
      updateTxHash:
        '92bd050ec1da6d25abf6265a6f8318a79a3068459254a79427088407c4241b37',
    },
  },
  {
    order: {
      actualAmountOut: 0.00037900000000012923,
      aggregator: 'muesliswap',
      amountIn: 1,
      customId: '66cf043794579f05fc204f72',
      expectedAmountOut: 0.000368,
      lastUpdate: 1719137534000,
      placedAt: 1719137466000,
      protocol: 'sundaeswap-v1',
      status: 'matched',
      tokenIn:
        'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
      tokenOut: '.',
      txHash:
        '8751fbef1ebec0d2da9218a69493ef36070012ce24fdbc44ec6df519377b92bf',
      updateTxHash:
        '92bd050ec1da6d25abf6265a6f8318a79a3068459254a79427088407c4241b37',
    },
  },
]

const cancelRequest: CancelRequest = {
  output_idx: 0,
  tx_hash: '8751fbef1ebec0d2da9218a69493ef36070012ce24fdbc44ec6df519377b92bf',
}

const cancelResponse: CancelResponse = {
  tx_cbor: 'DEADBEEF',
}

const cancelResult: Swap.CancelResponse = {
  cbor: cancelResponse.tx_cbor,
}

const quoteLimitInput: Swap.EstimateRequest = {
  slippage: 0.01,
  tokenIn: '.',
  amountOut: 1,
  tokenOut: 'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
  protocol: 'minswap-v1',
}

const quoteLimitRequest: QuoteRequest = {
  buy_amount: 0,
  buy_token: quoteLimitInput.tokenOut,
  dex: 'minswap-v1',
  numbers_have_decimals: true,
  sell_amount: 0,
  sell_token: quoteLimitInput.tokenIn,
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

const quoteRequest: QuoteRequest = {
  buy_token: quoteInput.tokenOut,
  sell_token: quoteInput.tokenIn,
  sell_amount: quoteInput.amountIn,
  slippage: quoteInput.slippage / 100,
  buy_amount: quoteInput.amountOut,
  numbers_have_decimals: true,
  dex: ['minswap-v1'],
  partner: 'somePartnerId',
}

const quoteResponse: QuoteResponse = {
  total_lvl_attached: '4.000000',
  total_deposit: '2.000000',
  total_batcher_fee: '2.000000',
  total_output: '1130',
  total_input: '1.000000',
  buy_token_decimals: 0,
  sell_token_decimals: 6,
  net_price: 0.00113,
  net_price_impact: 1.258404559451805,
  frontend_fee: '0.000000',
  numbers_have_decimals: true,
  total_output_without_slippage: '1130',
  splits: [
    {
      amount_in: '1.000000',
      total_lvl_attached: '4.000000',
      deposit: '2.000000',
      batcher_fee: '2.000000',
      expected_output: '1130',
      source_id:
        '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
      initial_price: 0.04252918925670425,
      final_price: 0.041994,
      price_impact: 1.258404559451805,
      price_distortion: -4.631246793465151,
      dex: 'minswap-v1',
      pool_fee: 0.3,
      expected_output_without_slippage: '1130',
    },
  ],
}

const quoteNoOutResponse: QuoteResponse = {
  total_lvl_attached: '4.000000',
  total_deposit: '2.000000',
  total_batcher_fee: '2.000000',
  total_output: '1130',
  total_input: '1.000000',
  buy_token_decimals: 0,
  sell_token_decimals: 6,
  net_price: 0.00113,
  net_price_impact: 1.258404559451805,
  frontend_fee: '0.000000',
  numbers_have_decimals: true,
  splits: [
    {
      amount_in: '1.000000',
      total_lvl_attached: '4.000000',
      deposit: '2.000000',
      batcher_fee: '2.000000',
      expected_output: '1130',
      source_id:
        '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
      initial_price: 0.04252918925670425,
      final_price: 0.041994,
      price_impact: 1.258404559451805,
      price_distortion: -4.631246793465151,
      dex: 'minswap-v1',
      pool_fee: 0.3,
    },
  ],
}

const quoteResult: Swap.EstimateResponse = {
  aggregatorFee: 0,
  batcherFee: 2,
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
      priceDistortion: -4.631246793465151,
      priceImpact: 1.258404559451805,
      protocol: 'minswap-v1',
    },
  ],
  totalFee: 2,
  totalInput: 1,
  totalOutput: 1130,
  totalOutputWithoutSlippage: 1130,
}

const quoteNoOutResult: Swap.EstimateResponse = {
  aggregatorFee: 0,
  batcherFee: 2,
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
      priceDistortion: -4.631246793465151,
      priceImpact: 1.258404559451805,
      protocol: 'minswap-v1',
    },
  ],
  totalFee: 2,
  totalInput: 1,
  totalOutput: 1130,
}

const createLimitInput: Array<Swap.CreateRequest> = [
  {
    tokenOut:
      'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354',
    tokenIn: '.',
    wantedPrice: 1,
    amountIn: 1,
    protocol: 'minswap-v1',
  },
  // NOTE: missing data
  {
    tokenOut:
      'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354',
    tokenIn: '.',
    amountIn: 1,
  },
]

const createLimitRequest = (address: string): CreateOrderRequest => ({
  sell_token: '.',
  sell_amount: 1,
  user_address: address,
  buy_token:
    'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354',
  buy_amount: 1,
  dex: 'minswap-v1',
  numbers_have_decimals: true,
})

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
]

const createLimitResponse: CreateOrderResponse = {
  quote: {
    total_lvl_attached: '4.000000',
    total_deposit: '2.000000',
    total_batcher_fee: '2.000000',
    total_output: '1130',
    total_input: '1.000000',
    buy_token_decimals: 0,
    sell_token_decimals: 6,
    net_price: 0.00113,
    net_price_impact: 1.258404559451805,
    frontend_fee: '0.000000',
    numbers_have_decimals: true,
    total_output_without_slippage: '1130',
    splits: [
      {
        amount_in: '1.000000',
        total_lvl_attached: '4.000000',
        deposit: '2.000000',
        batcher_fee: '2.000000',
        expected_output: '1130',
        source_id:
          '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
        initial_price: 0.04252918925670425,
        final_price: 0.041994,
        price_impact: 1.258404559451805,
        price_distortion: -4.631246793465151,
        dex: 'minswap-v1',
        pool_fee: 0.3,
        expected_output_without_slippage: '1130',
      },
    ],
  },
  tx_cbor:
    '84a500838258203976997901257e283cc9da856b9e50174c4eb9dfd8ce55b5be9fbe2f9289577500825820475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf03825820e22c3b1fd8e77643612bb2611e8fb74238ba540867dd9d4ecaec1590c613566400018283583911a65ca58a4e9c755fa830173d2a5caed458ac0c73f97db7faae2e7e3b52563c5410bff6a0d43ccebb7c37e1f69f5eb260552521adff33b9c21a004c4b40582079aaea3504c39973f6bd387a2250e3553220722f429ffddbf6dae7f3c7bfb61c825839014747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aecf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdc821a005a5946ac581c2441ab3351c3b80213a98f4e09ddcf7dabe4879c3c94cc4e7205cb63a144464952451909e3581c279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3fa144534e454b18cc581c4cb48d60d1f7823d1307c61b9ecf472ff78cf22d1ccc5786d59461f8a1474144414d4f4f4e1a004c3d2e581c8654e8b350e298c80d2451beb5ed80fc9eee9f38ce6b039fb8706bc3a1474c4f42535445521a0010f66f581ca0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235a145484f534b591a06e8f5c4581cafbe91c0b44b3040e360057bf8354ead8c49c4979ae6ab7c4fbdc9eba1464d494c4b76321a00424fe1581cb788fbee71a32d2efc5ee7d151f3917d99160f78fb1e41a1bbf80d8fa1494c454146544f4b454e1b0000000536f5613f581cc5609c4800c05e82c4219ccf14c7fdf5212e11f83dbbb57ac716e98ea145666c756666186f581cc898c986b97e7ac5b33e999bc11b054a9987f48ec4459f8c1ea0c32ba148435245414d5049451a06a21941581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48aa144434153541911bd581ce0c4c2d7c4a0ed2cf786753fd845dee82c45512cee03e92adfd3fb8da14d6a6176696275656e6f2e61646101581cf0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9aa14d000de1406a6176696275656e6f01021a0003388d0758203ee91922e55ac83b91cdce3d7aa8fb01085e26622a6da92bad3908c29cbffca00b582067cbc9782dbb59e371f3dbc4eeba0b20cdeb91e1b7f53efaccd58f78975a50fba10481d8799fd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd87a80d8799fd8799f581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a4443415354ff19046aff1a001e84801a001e8480fff5a11902a2783b7b276d7367273a205b274d7565736c69537761702041676772656761746f7220506c61636520437573746f6d204c696d6974204f72646572275d7d',
}

const createLimitResult: Swap.CreateResponse = {
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
      priceDistortion: -4.631246793465151,
      priceImpact: 1.258404559451805,
      protocol: 'minswap-v1',
    },
  ],
  totalFee: 2,
  totalInput: 1,
  totalOutput: 1130,
  totalOutputWithoutSlippage: 1130,
}

const createRequest = (address: string): Array<CreateOrderRequest> => [
  {
    sell_token: '.',
    sell_amount: 1,
    user_address: address,
    buy_token:
      'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354',
    dex: [
      'muesliswap-v2',
      'muesliswap-clp',
      'minswap-v1',
      'minswap-v2',
      'minswap-stable',
      'spectrum-v1',
      'teddy-v1',
      'wingriders-v1',
      'wingriders-v2',
      'vyfi-v1',
      'sundaeswap-v1',
      'sundaeswap-v3',
    ],
    numbers_have_decimals: true,
    slippage: 0,
    partner: 'somePartnerId',
  },
  {
    sell_token: '.',
    sell_amount: 1,
    user_address: address,
    buy_token:
      'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354',
    dex: ['minswap-v1'],
    numbers_have_decimals: true,
    slippage: 0.02,
    partner: 'somePartnerId',
  },
]

const createResponse: CreateOrderResponse = {
  quote: {
    total_lvl_attached: '4.000000',
    total_deposit: '2.000000',
    total_batcher_fee: '2.000000',
    total_output: '1130',
    total_input: '1.000000',
    buy_token_decimals: 0,
    sell_token_decimals: 6,
    net_price: 0.00113,
    net_price_impact: 1.258404559451805,
    frontend_fee: '0.000000',
    numbers_have_decimals: true,
    total_output_without_slippage: '1130',
    splits: [
      {
        amount_in: '1.000000',
        total_lvl_attached: '4.000000',
        deposit: '2.000000',
        batcher_fee: '2.000000',
        expected_output: '1130',
        source_id:
          '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
        initial_price: 0.04252918925670425,
        final_price: 0.041994,
        price_impact: 1.258404559451805,
        price_distortion: -4.631246793465151,
        dex: 'minswap-v1',
        pool_fee: 0.3,
        expected_output_without_slippage: '1130',
      },
    ],
  },
  tx_cbor:
    '84a500838258203976997901257e283cc9da856b9e50174c4eb9dfd8ce55b5be9fbe2f9289577500825820475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf03825820e22c3b1fd8e77643612bb2611e8fb74238ba540867dd9d4ecaec1590c613566400018283583911a65ca58a4e9c755fa830173d2a5caed458ac0c73f97db7faae2e7e3b52563c5410bff6a0d43ccebb7c37e1f69f5eb260552521adff33b9c21a004c4b40582079aaea3504c39973f6bd387a2250e3553220722f429ffddbf6dae7f3c7bfb61c825839014747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aecf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdc821a005a5946ac581c2441ab3351c3b80213a98f4e09ddcf7dabe4879c3c94cc4e7205cb63a144464952451909e3581c279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3fa144534e454b18cc581c4cb48d60d1f7823d1307c61b9ecf472ff78cf22d1ccc5786d59461f8a1474144414d4f4f4e1a004c3d2e581c8654e8b350e298c80d2451beb5ed80fc9eee9f38ce6b039fb8706bc3a1474c4f42535445521a0010f66f581ca0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235a145484f534b591a06e8f5c4581cafbe91c0b44b3040e360057bf8354ead8c49c4979ae6ab7c4fbdc9eba1464d494c4b76321a00424fe1581cb788fbee71a32d2efc5ee7d151f3917d99160f78fb1e41a1bbf80d8fa1494c454146544f4b454e1b0000000536f5613f581cc5609c4800c05e82c4219ccf14c7fdf5212e11f83dbbb57ac716e98ea145666c756666186f581cc898c986b97e7ac5b33e999bc11b054a9987f48ec4459f8c1ea0c32ba148435245414d5049451a06a21941581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48aa144434153541911bd581ce0c4c2d7c4a0ed2cf786753fd845dee82c45512cee03e92adfd3fb8da14d6a6176696275656e6f2e61646101581cf0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9aa14d000de1406a6176696275656e6f01021a0003388d0758203ee91922e55ac83b91cdce3d7aa8fb01085e26622a6da92bad3908c29cbffca00b582067cbc9782dbb59e371f3dbc4eeba0b20cdeb91e1b7f53efaccd58f78975a50fba10481d8799fd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd87a80d8799fd8799f581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a4443415354ff19046aff1a001e84801a001e8480fff5a11902a2783b7b276d7367273a205b274d7565736c69537761702041676772656761746f7220506c61636520437573746f6d204c696d6974204f72646572275d7d',
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
      priceDistortion: -4.631246793465151,
      priceImpact: 1.258404559451805,
      protocol: 'minswap-v1',
    },
  ],
  totalFee: 2,
  totalInput: 1,
  totalOutput: 1130,
  totalOutputWithoutSlippage: 1130,
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
  totalFee: 4,
  totalInput: 9223372036854.775,
  totalOutput: 0,
  totalOutputWithoutSlippage: 0,
}

export const api = {
  inputs: {
    cancel: cancelInput,
    quote: quoteInput,
    quoteLimit: quoteLimitInput,
    create: createInput,
    createLimit: createLimitInput,
  },
  requests: {
    cancel: cancelRequest,
    quote: quoteRequest,
    quoteLimit: quoteLimitRequest,
    create: createRequest,
    createLimit: createLimitRequest,
  },
  responses: {
    tokens: tokensResponse,
    orders: ordersResponse,
    cancel: cancelResponse,
    quote: quoteResponse,
    quoteNoOut: quoteNoOutResponse,
    create: createResponse,
    createLimit: createLimitResponse,
  },
  results: {
    tokens: tokensResult,
    orders: ordersResult,
    cancel: cancelResult,
    estimate: estimateResult,
    quote: quoteResult,
    quoteNoOut: quoteNoOutResult,
    create: createResult,
    createLimit: createLimitResult,
  },
}
