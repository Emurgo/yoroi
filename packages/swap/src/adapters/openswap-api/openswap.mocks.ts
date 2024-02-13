import {
  CompletedOrder,
  LiquidityPool,
  ListTokensResponse,
  OpenOrder,
  PriceResponse,
  TokenPairsResponse,
} from './types'

const getTokens: ListTokensResponse = [
  {
    supply: {
      total: '10000000',
      circulating: '300',
    },
    status: 'verified',
    website: 'https://eggscape.io/',
    image: 'ipfs://QmNYibJoiTWRiMmWn4yXwvoakEPgq9WmaukmRXHF1VGbAU',
    description: 'Eggscape Club Utility Token',
    address: {
      policyId: '1c1e38cfcc815d2015dbda6bee668b2e707ee3f9d038d96668fcf63c',
      name: '4567677363617065436c75624561737465725a656e6e79',
    },
    symbol: 'EZY',
    decimalPlaces: 0,
    categories: [],
  },
  {
    supply: {
      total: '1500000000',
      circulating: null,
    },
    status: 'verified',
    symbol: 'CAST',
    decimalPlaces: 0,
    image:
      'https://tokens.muesliswap.com/static/img/tokens/cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354.png',
    description: 'Utility Token for Carda Station Metaverse',
    address: {
      policyId: 'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a',
      name: '43415354',
    },
    website: 'https://cardastation.com',
    categories: [],
  },
  {
    supply: {
      total: '387017195',
      circulating: null,
    },
    status: 'verified',
    website: 'https://www.shareslake.com',
    description:
      'The fiat-backed stablecoin issued by Shareslake. Powering the fully stable branch of Cardano.',
    image:
      'https://tokens.muesliswap.com/static/img/tokens/cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786.52656465656d61626c65.png',
    symbol: 'RUSD',
    decimalPlaces: 4,
    address: {
      policyId: 'cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786',
      name: '52656465656d61626c65',
    },
    categories: [],
  },
  {
    supply: {
      total: '45000000003000000',
      circulating: null,
    },
    status: 'verified',
    website: 'https://eduladder.com',
    symbol: 'ELADR',
    decimalPlaces: 6,
    image:
      'https://tokens.muesliswap.com/static/img/tokens/2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.4564756c6164646572546f6b656e.png',
    description: 'Proof Of Contribution.',
    address: {
      policyId: '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6',
      name: '4564756c6164646572546f6b656e',
    },
    categories: [],
  },
]

const getTokenPairs: TokenPairsResponse = [
  {
    info: {
      supply: {
        total: '10000000',
        circulating: '300',
      },
      status: 'verified',
      website: 'https://eggscape.io/',
      image: 'ipfs://QmNYibJoiTWRiMmWn4yXwvoakEPgq9WmaukmRXHF1VGbAU',
      description: 'Eggscape Club Utility Token',
      address: {
        policyId: '1c1e38cfcc815d2015dbda6bee668b2e707ee3f9d038d96668fcf63c',
        name: '4567677363617065436c75624561737465725a656e6e79',
      },
      symbol: 'EZY',
      decimalPlaces: 0,
      categories: [],
    },
    price: {
      volume: {
        base: '0',
        quote: '0',
      },
      volumeChange: {
        base: 0,
        quote: 0,
      },
      // volumeTotal: {
      //   base: 0,
      //   quote: 0,
      // },
      // volumeAggregator: {},
      price: 5052.63204588242,
      askPrice: 9997.99630605055,
      bidPrice: 107.26778571429,
      priceChange: {
        '24h': '0.0',
        '7d': '0.0',
      },
      // fromToken: '.',
      // toToken:
      //   '1c1e38cfcc815d2015dbda6bee668b2e707ee3f9d038d96668fcf63c.4567677363617065436c75624561737465725a656e6e79',
      price10d: [
        10004.374362563743, 10004.374362563743, 10004.374362563743,
        10004.374362563743, 10004.374362563743, 10004.374362563743,
        10004.374362563743, 10004.374362563743, 10004.374362563743,
        10004.374362563743,
      ],
      quoteDecimalPlaces: 0,
      baseDecimalPlaces: 6,
      // quoteAddress: {
      //   policyId: '1c1e38cfcc815d2015dbda6bee668b2e707ee3f9d038d96668fcf63c',
      //   name: '4567677363617065436c75624561737465725a656e6e79',
      // },
      // baseAddress: {
      //   policyId: '',
      //   name: '',
      // },
    },
  },
  {
    info: {
      supply: {
        total: '1500000000',
        circulating: null,
      },
      status: 'verified',
      symbol: 'CAST',
      decimalPlaces: 0,
      image:
        'https://tokens.muesliswap.com/static/img/tokens/cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354.png',
      description: 'Utility Token for Carda Station Metaverse',
      address: {
        policyId: 'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a',
        name: '43415354',
      },
      website: 'https://cardastation.com',
      categories: [],
    },
    price: {
      volume: {
        base: '0',
        quote: '0',
      },
      volumeChange: {
        base: 0,
        quote: 0,
      },
      // volumeTotal: {
      //   base: 0,
      //   quote: 0,
      // },
      // volumeAggregator: {},
      price: 402.13135196041,
      askPrice: 1000,
      bidPrice: 200.33388981636,
      priceChange: {
        '24h': '0.0',
        '7d': '0.0',
      },
      // fromToken: '.',
      // toToken:
      //   'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354',
      price10d: [
        690.7737494922812, 690.7737494922812, 690.7737494922812,
        690.7737494922812, 690.7737494922812, 690.7737494922812,
        690.7737494922812, 690.7737494922812, 690.7737494922812,
        690.7737494922812,
      ],
      quoteDecimalPlaces: 0,
      baseDecimalPlaces: 6,
      // quoteAddress: {
      //   policyId: 'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a',
      //   name: '43415354',
      // },
      // baseAddress: {
      //   policyId: '',
      //   name: '',
      // },
    },
  },
  {
    info: {
      supply: {
        total: '387017195',
        circulating: null,
      },
      status: 'verified',
      website: 'https://www.shareslake.com',
      description:
        'The fiat-backed stablecoin issued by Shareslake. Powering the fully stable branch of Cardano.',
      image:
        'https://tokens.muesliswap.com/static/img/tokens/cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786.52656465656d61626c65.png',
      symbol: 'RUSD',
      decimalPlaces: 4,
      address: {
        policyId: 'cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786',
        name: '52656465656d61626c65',
      },
      categories: [],
    },
    price: {
      volume: {
        base: '0',
        quote: '0',
      },
      volumeChange: {
        base: 0,
        quote: 0,
      },
      // volumeTotal: {
      //   base: 0,
      //   quote: 0,
      // },
      // volumeAggregator: {},
      price: 222.76258782201,
      askPrice: 240.60714285714,
      bidPrice: 204.91803278689,
      priceChange: {
        '24h': '0',
        '7d': '0',
      },
      // fromToken: '.',
      // toToken:
      //   'cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786.52656465656d61626c65',
      price10d: [],
      quoteDecimalPlaces: 4,
      baseDecimalPlaces: 6,
      // quoteAddress: {
      //   policyId: 'cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786',
      //   name: '52656465656d61626c65',
      // },
      // baseAddress: {
      //   policyId: '',
      //   name: '',
      // },
    },
  },
  {
    info: {
      supply: {
        total: '45000000003000000',
        circulating: null,
      },
      status: 'verified',
      website: 'https://eduladder.com',
      symbol: 'ELADR',
      decimalPlaces: 6,
      image:
        'https://tokens.muesliswap.com/static/img/tokens/2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.4564756c6164646572546f6b656e.png',
      description: 'Proof Of Contribution.',
      address: {
        policyId: '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6',
        name: '4564756c6164646572546f6b656e',
      },
      categories: [],
    },
    price: {
      volume: {
        base: '0',
        quote: '0',
      },
      volumeChange: {
        base: 0,
        quote: 0,
      },
      // volumeTotal: {
      //   base: 0,
      //   quote: 0,
      // },
      // volumeAggregator: {},
      price: 1.94e-8,
      askPrice: 1.995e-8,
      bidPrice: 1.885e-8,
      priceChange: {
        '24h': '0.0',
        '7d': '0.0',
      },
      // fromToken: '.',
      // toToken:
      //   '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.4564756c6164646572546f6b656e',
      price10d: [
        1.4529723607353359e-8, 1.4529723607353359e-8, 1.4529723607353359e-8,
        1.4529723607353359e-8, 1.4529723607353359e-8, 1.4529723607353359e-8,
        1.4529723607353359e-8, 1.4529723607353359e-8, 1.4529723607353359e-8,
        1.4529723607353359e-8,
      ],
      quoteDecimalPlaces: 6,
      baseDecimalPlaces: 6,
      // quoteAddress: {
      //   policyId: '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6',
      //   name: '4564756c6164646572546f6b656e',
      // },
      // baseAddress: {
      //   policyId: '',
      //   name: '',
      // },
    },
  },
]

const getCompletedOrders: CompletedOrder[] = [
  {
    toToken: {
      address: {
        policyId: 'c04f4200502a998e9eebafac0291a1f38008de3fe146d136946d8f4b',
        name: '415247454e54',
      },
    },
    toAmount: '100',
    fromToken: {
      address: {
        policyId: '',
        name: '',
      },
    },
    fromAmount: '200',
    placedAt: 1631635254, // Unix timestamp
    status: 'completed',
    receivedAmount: '100',
    paidAmount: '200',
    finalizedAt: 1631635354, // You can specify a more specific type if needed
    txHash: '0e56f8d48808e689c1aed60abc158b7aef21c3565a0b766dd89ffba31979414b',
    outputIdx: 0,
    attachedLvl: 'someAttachedLvl',
    scriptVersion: 'v1',
    pubKeyHash: 'somePubKeyHash',
    feeField: 10,
  },
]

const getOpenOrders: OpenOrder[] = [
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
    // sender:
    //   'addr1qy0556dz9jssrrnhv0g3ga98uczdd465cut9jjs5a4k5qy3yl52kwxsh5wfx3darrc4xwql43ylj2n29dpq3xg46a6mska8vfz',
    // owner:
    //   'addr1qy0556dz9jssrrnhv0g3ga98uczdd465cut9jjs5a4k5qy3yl52kwxsh5wfx3darrc4xwql43ylj2n29dpq3xg46a6mska8vfz',
    // ownerPubKeyHash: '1f4a69a22ca1018e7763d11474a7e604d6d754c716594a14ed6d4012',
    // ownerStakeKeyHash:
    //   '24fd15671a17a39268b7a31e2a6703f5893f254d4568411322baeeb7',
    // batcherFee: {
    //   amount: '950000',
    //   token: '.',
    // },
    deposit: '1700000',
    // valueAttached: [
    //   {
    //     amount: '3650000',
    //     token: '.',
    //   },
    // ],
    utxo: '1e977694e2413bd0e6105303bb44da60530cafe49b864dde8f8902b021ed86ba#0',
    provider: 'muesliswap_v4',
    // feeField: '2650000',
    // allowPartial: true,
    owner:
      'addr1qxxvt9rzpdxxysmqp50d7f5a3gdescgrejsu7zsdxqjy8yun4cngaq46gr8c9qyz4td9ddajzqhjnrqvfh0gspzv9xnsmq6nqx',
  },
]

const getLiquidityPools: LiquidityPool[] = [
  {
    provider: 'minswap',
    poolFee: '0.3',
    tokenA: {
      amount: '1233807687',
      address: {
        policyId: '',
        name: '',
      },
      symbol: '',
      image: '',
      decimalPlaces: 0,
      status: '',
      priceAda: 0,
    },
    tokenB: {
      amount: '780',
      address: {
        policyId: 'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72',
        name: '43414b45',
      },
      symbol: '',
      image: '',
      decimalPlaces: 0,
      status: '',
      priceAda: 0,
    },
    batcherFee: '2000000',
    // depositFee: {
    //   amount: '2000000',
    //   token: '.',
    // },
    lvlDeposit: '2000000',
    batcherAddress: 'someBatcherAddress',
    feeToken: {
      address: {
        policyId: '.',
        name: '.',
      },
      decimalPlaces: 0,
    },
    txHash: '0596860b5970ef989c56f7ae38b3c0f74bb4979ac15ee994c30760f7f4d908ce',
    outputIdx: 0,
    poolId:
      '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    lpToken: {
      amount: '981004',
      address: {
        policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
        name: '7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
      },
    },
  },
  {
    provider: 'sundaeswap',
    poolFee: '0.3',
    tokenA: {
      amount: '1233807687',
      address: {
        policyId: '',
        name: '',
      },
      symbol: '',
      image: '',
      decimalPlaces: 0,
      status: '',
      priceAda: 0,
    },
    tokenB: {
      amount: '780',
      address: {
        policyId: 'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72',
        name: '43414b45',
      },
      symbol: '',
      image: '',
      decimalPlaces: 0,
      status: '',
      priceAda: 0,
    },
    batcherFee: '2000000',
    // depositFee: {
    //   amount: '2000000',
    //   token: '.',
    // },
    lvlDeposit: '2000000',
    txHash: '0596860b5970ef989c56f7ae38b3c0f74bb4979ac15ee994c30760f7f4d908ce',
    outputIdx: 0,
    batcherAddress: 'someBatcherAddress',
    feeToken: {
      address: {
        policyId: '.',
        name: '.',
      },
      decimalPlaces: 0,
    },
    poolId:
      '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    lpToken: {
      amount: '981004',
      address: {
        policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
        name: '7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
      },
    },
  },
  {
    provider: 'sundaeswap',
    poolFee: '0.3',
    tokenA: {
      amount: '1233807687',
      address: {
        policyId: '',
        name: '',
      },
      symbol: '',
      image: '',
      decimalPlaces: 0,
      status: '',
      priceAda: 0,
    },
    tokenB: {
      amount: '780',
      address: {
        policyId: 'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72',
        name: '43414b45',
      },
      symbol: '',
      image: '',
      decimalPlaces: 0,
      status: '',
      priceAda: 0,
    },
    batcherFee: '2000000',
    // depositFee: {
    //   amount: '2000000',
    //   token: '.',
    // },
    lvlDeposit: '2000000',
    txHash: '0596860b5970ef989c56f7ae38b3c0f74bb4979ac15ee994c30760f7f4d908ce',
    outputIdx: 0,
    batcherAddress: 'someBatcherAddress',
    feeToken: {
      address: {
        policyId: '.',
        name: '.',
      },
      decimalPlaces: 0,
    },
    poolId:
      '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    lpToken: {
      amount: '981004',
      address: {
        policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
        name: '7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
      },
    },
  },
  {
    provider: 'spectrum', // unsupported pool
    poolFee: '0.3',
    tokenA: {
      amount: '1233807687',
      address: {
        policyId: '',
        name: '',
      },
      symbol: '',
      image: '',
      decimalPlaces: 0,
      status: '',
      priceAda: 0,
    },
    tokenB: {
      amount: '780',
      address: {
        policyId: 'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72',
        name: '43414b45',
      },
      symbol: '',
      image: '',
      decimalPlaces: 0,
      status: '',
      priceAda: 0,
    },
    batcherFee: '2000000',
    // depositFee: {
    //   amount: '2000000',
    //   token: '.',
    // },
    lvlDeposit: '2000000',
    txHash: '0596860b5970ef989c56f7ae38b3c0f74bb4979ac15ee994c30760f7f4d908ce',
    outputIdx: 0,
    batcherAddress: 'someBatcherAddress',
    feeToken: {
      address: {
        policyId: '.',
        name: '.',
      },
      decimalPlaces: 0,
    },
    poolId:
      '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    lpToken: {
      amount: '981004',
      address: {
        policyId: 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86',
        name: '7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
      },
    },
  },
]

const getPrice: PriceResponse = {
  baseDecimalPlaces: 6,
  quoteDecimalPlaces: 6,
  baseAddress: {
    policyId: '',
    name: '',
  },
  quoteAddress: {
    policyId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6',
    name: '4d494e',
  },
  askPrice: 0.08209814208,
  bidPrice: 0.06319999985,
  price: 0.07080044463,
  volume: {
    base: '14735349',
    quote: '211287611',
  },
  volumeAggregator: {
    minswap: {
      quote: 107413106646,
      base: 7651672996,
    },
    sundaeswap: {
      quote: 566084169,
      base: 39000000,
    },
    vyfi: {
      quote: 12370434748,
      base: 879028993,
    },
  },
  volumeTotal: {
    base: 8584437338,
    quote: 120560913174,
  },
  volumeChange: {
    base: 0,
    quote: 0,
  },
  priceChange: {
    '24h': '-0.2374956426253183',
    '7d': '8.757469657697857',
  },
  marketCap: 68873484244745.086,
}

export const openswapMocks = {
  getTokenPairs,
  getTokens,
  getPrice,
  getCompletedOrders,
  getOpenOrders,
  getLiquidityPools,
}
