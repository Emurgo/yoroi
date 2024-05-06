import {Balance, Swap} from '@yoroi/types'

const getOpenOrders: Array<Swap.OpenOrder> = [
  {
    utxo: '1e977694e2413bd0e6105303bb44da60530cafe49b864dde8f8902b021ed86ba#0',
    provider: 'muesliswap_v4',
    from: {quantity: '1000000', tokenId: ''},
    to: {
      quantity: '41372',
      tokenId:
        '2adf188218a66847024664f4f63939577627a56c090f679fe366c5ee.535441424c45',
    },
    deposit: {quantity: '1700000', tokenId: ''},
    owner:
      'addr1qxxvt9rzpdxxysmqp50d7f5a3gdescgrejsu7zsdxqjy8yun4cngaq46gr8c9qyz4td9ddajzqhjnrqvfh0gspzv9xnsmq6nqx',
  },
]

const getCompletedOrders: Array<Swap.CompletedOrder> = [
  {
    txHash: '0e56f8d48808e689c1aed60abc158b7aef21c3565a0b766dd89ffba31979414b',
    from: {quantity: '200', tokenId: ''},
    to: {
      quantity: '100',
      tokenId:
        'c04f4200502a998e9eebafac0291a1f38008de3fe146d136946d8f4b.415247454e54',
    },
    provider: 'minswap',
    placedAt: 1631635254000,
  },
]

const createOrderData: Swap.CreateOrderData = {
  address: 'someAddress',
  selectedPool: {
    provider: 'minswap',
    fee: '',
    tokenA: {
      tokenId:
        'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72.43414b45',
      quantity: '1000',
    },
    tokenB: {tokenId: '', quantity: '1000000000'},
    ptPriceTokenA: '0',
    ptPriceTokenB: '0',
    batcherFee: {tokenId: '', quantity: '0'},
    deposit: {tokenId: '', quantity: '2000000'},
    poolId:
      '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    lpToken: {tokenId: '', quantity: '0'},
  },
  amounts: {
    sell: {
      quantity: '1',
      tokenId:
        'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72.43414b45',
    },
    buy: {quantity: '100', tokenId: ''},
  },
  slippage: 1,
  limitPrice: undefined,
}

const getPools: Swap.Pool[] = [
  {
    tokenA: {quantity: '1233807687', tokenId: ''},
    tokenB: {
      quantity: '780',
      tokenId:
        'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72.43414b45',
    },
    ptPriceTokenA: '0',
    ptPriceTokenB: '0',
    deposit: {quantity: '2000000', tokenId: ''},
    lpToken: {
      quantity: '981004',
      tokenId:
        'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    },
    batcherFee: {quantity: '2000000', tokenId: ''},
    fee: '0.3',
    poolId:
      '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    provider: 'minswap',
  },
  {
    tokenA: {quantity: '1233807687', tokenId: ''},
    tokenB: {
      quantity: '780',
      tokenId:
        'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72.43414b45',
    },
    ptPriceTokenA: '0',
    ptPriceTokenB: '0',
    deposit: {quantity: '2000000', tokenId: ''},
    lpToken: {
      quantity: '981004',
      tokenId:
        'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    },
    batcherFee: {quantity: '2000000', tokenId: ''},
    fee: '0.3',
    poolId:
      '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    provider: 'sundaeswap',
  },
  {
    tokenA: {quantity: '1233807687', tokenId: ''},
    tokenB: {
      quantity: '780',
      tokenId:
        'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72.43414b45',
    },
    ptPriceTokenA: '0',
    ptPriceTokenB: '0',
    deposit: {quantity: '2000000', tokenId: ''},
    lpToken: {
      quantity: '981004',
      tokenId:
        'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    },
    batcherFee: {quantity: '2000000', tokenId: ''},
    fee: '0.3',
    poolId:
      '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    provider: 'sundaeswap',
  },
]

const getTokenPairs: Balance.Token[] = [
  {
    info: {
      id: '1c1e38cfcc815d2015dbda6bee668b2e707ee3f9d038d96668fcf63c.4567677363617065436c75624561737465725a656e6e79',
      group: '1c1e38cfcc815d2015dbda6bee668b2e707ee3f9d038d96668fcf63c',
      fingerprint: 'asset126v2sm79r8uxvk4ju64mr6srxrvm2x75fpg6w3',
      name: 'EggscapeClubEasterZenny',
      decimals: 0,
      description: 'Eggscape Club Utility Token',
      image: 'ipfs://QmNYibJoiTWRiMmWn4yXwvoakEPgq9WmaukmRXHF1VGbAU',
      kind: 'ft',
      symbol: undefined,
      icon: undefined,
      ticker: 'EZY',
      metadatas: {},
    },
    price: {
      volume: {base: '0', quote: '0'},
      volumeChange: {base: 0, quote: 0},
      price: 5052.63204588242,
      askPrice: 9997.99630605055,
      bidPrice: 107.26778571429,
      priceChange: {'24h': '0.0', '7d': '0.0'},
      price10d: [
        10004.374362563743, 10004.374362563743, 10004.374362563743,
        10004.374362563743, 10004.374362563743, 10004.374362563743,
        10004.374362563743, 10004.374362563743, 10004.374362563743,
        10004.374362563743,
      ],
      quoteDecimalPlaces: 0,
      baseDecimalPlaces: 6,
    },
    status: 'verified',
    supply: {total: '10000000', circulating: '300'},
  },
  {
    info: {
      id: 'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354',
      group: 'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a',
      fingerprint: 'asset1yv4fx867hueqt98aqvjw5ncjymz8k3ah8zawcg',
      name: 'CAST',
      decimals: 0,
      description: 'Utility Token for Carda Station Metaverse',
      image:
        'https://tokens.muesliswap.com/static/img/tokens/cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354.png',
      kind: 'ft',
      symbol: undefined,
      icon: undefined,
      ticker: 'CAST',
      metadatas: {},
    },
    price: {
      volume: {base: '0', quote: '0'},
      volumeChange: {base: 0, quote: 0},
      price: 402.13135196041,
      askPrice: 1000,
      bidPrice: 200.33388981636,
      priceChange: {'24h': '0.0', '7d': '0.0'},
      price10d: [
        690.7737494922812, 690.7737494922812, 690.7737494922812,
        690.7737494922812, 690.7737494922812, 690.7737494922812,
        690.7737494922812, 690.7737494922812, 690.7737494922812,
        690.7737494922812,
      ],
      quoteDecimalPlaces: 0,
      baseDecimalPlaces: 6,
    },
    status: 'verified',
    supply: {total: '1500000000', circulating: null},
  },
  {
    info: {
      id: 'cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786.52656465656d61626c65',
      group: 'cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786',
      fingerprint: 'asset18qw75gcdldlu7q5xh8fjsemgvwffzkg8hatq3s',
      name: 'Redeemable',
      decimals: 4,
      description:
        'The fiat-backed stablecoin issued by Shareslake. Powering the fully stable branch of Cardano.',
      image:
        'https://tokens.muesliswap.com/static/img/tokens/cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786.52656465656d61626c65.png',
      kind: 'ft',
      symbol: undefined,
      icon: undefined,
      ticker: 'RUSD',
      metadatas: {},
    },
    price: {
      volume: {base: '0', quote: '0'},
      volumeChange: {base: 0, quote: 0},
      price: 222.76258782201,
      askPrice: 240.60714285714,
      bidPrice: 204.91803278689,
      priceChange: {'24h': '0', '7d': '0'},
      price10d: [],
      quoteDecimalPlaces: 4,
      baseDecimalPlaces: 6,
    },
    status: 'verified',
    supply: {total: '387017195', circulating: null},
  },
  {
    info: {
      id: '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.4564756c6164646572546f6b656e',
      group: '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6',
      fingerprint: 'asset1ny2ehvl20cp5y7mmn5qq332sgdncdmsgrcqlwh',
      name: 'EduladderToken',
      decimals: 6,
      description: 'Proof Of Contribution.',
      image:
        'https://tokens.muesliswap.com/static/img/tokens/2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.4564756c6164646572546f6b656e.png',
      kind: 'ft',
      symbol: undefined,
      icon: undefined,
      ticker: 'ELADR',
      metadatas: {},
    },
    price: {
      volume: {base: '0', quote: '0'},
      volumeChange: {base: 0, quote: 0},
      price: 1.94e-8,
      askPrice: 1.995e-8,
      bidPrice: 1.885e-8,
      priceChange: {'24h': '0.0', '7d': '0.0'},
      price10d: [
        1.4529723607353359e-8, 1.4529723607353359e-8, 1.4529723607353359e-8,
        1.4529723607353359e-8, 1.4529723607353359e-8, 1.4529723607353359e-8,
        1.4529723607353359e-8, 1.4529723607353359e-8, 1.4529723607353359e-8,
        1.4529723607353359e-8,
      ],
      quoteDecimalPlaces: 6,
      baseDecimalPlaces: 6,
    },
    status: 'verified',
    supply: {total: '45000000003000000', circulating: null},
  },
]

const getTokens: Balance.TokenInfo[] = [
  {
    id: '1c1e38cfcc815d2015dbda6bee668b2e707ee3f9d038d96668fcf63c.4567677363617065436c75624561737465725a656e6e79',
    group: '1c1e38cfcc815d2015dbda6bee668b2e707ee3f9d038d96668fcf63c',
    fingerprint: 'asset126v2sm79r8uxvk4ju64mr6srxrvm2x75fpg6w3',
    name: 'EggscapeClubEasterZenny',
    decimals: 0,
    description: 'Eggscape Club Utility Token',
    image: 'ipfs://QmNYibJoiTWRiMmWn4yXwvoakEPgq9WmaukmRXHF1VGbAU',
    kind: 'ft',
    symbol: undefined,
    icon: undefined,
    ticker: 'EZY',

    metadatas: {},
  },
  {
    id: 'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354',
    group: 'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a',
    fingerprint: 'asset1yv4fx867hueqt98aqvjw5ncjymz8k3ah8zawcg',
    name: 'CAST',
    decimals: 0,
    description: 'Utility Token for Carda Station Metaverse',
    image:
      'https://tokens.muesliswap.com/static/img/tokens/cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354.png',
    kind: 'ft',
    symbol: undefined,
    icon: undefined,
    ticker: 'CAST',
    metadatas: {},
  },
  {
    id: 'cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786.52656465656d61626c65',
    group: 'cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786',
    fingerprint: 'asset18qw75gcdldlu7q5xh8fjsemgvwffzkg8hatq3s',
    name: 'Redeemable',
    decimals: 4,
    description:
      'The fiat-backed stablecoin issued by Shareslake. Powering the fully stable branch of Cardano.',
    image:
      'https://tokens.muesliswap.com/static/img/tokens/cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786.52656465656d61626c65.png',
    kind: 'ft',
    symbol: undefined,
    icon: undefined,
    ticker: 'RUSD',
    metadatas: {},
  },
  {
    id: '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.4564756c6164646572546f6b656e',
    group: '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6',
    fingerprint: 'asset1ny2ehvl20cp5y7mmn5qq332sgdncdmsgrcqlwh',
    name: 'EduladderToken',
    decimals: 6,
    description: 'Proof Of Contribution.',
    image:
      'https://tokens.muesliswap.com/static/img/tokens/2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.4564756c6164646572546f6b656e.png',
    kind: 'ft',
    symbol: undefined,
    icon: undefined,
    ticker: 'ELADR',
    metadatas: {},
  },
  {
    id: '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.FFFFFF',
    group: '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6',
    fingerprint: 'asset1ud7y8pzglxmf68jtww3xhpes9j87akx4mtyx28',
    name: 'FFFFFF',
    decimals: 6,
    description: 'Proof Of Contribution.',
    image:
      'https://tokens.muesliswap.com/static/img/tokens/2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.4564756c6164646572546f6b656e.png',
    kind: 'ft',
    symbol: undefined,
    icon: undefined,
    ticker: 'ELADR',
    metadatas: {},
  },
]

export const apiMocks = {
  getOpenOrders,
  getCompletedOrders,
  createOrderData,
  getPools,
  getTokenPairs,
  getTokens,
}
