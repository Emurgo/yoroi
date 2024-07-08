import {Portfolio, Swap} from '@yoroi/types'

const getOpenOrders: Array<Swap.OpenOrder> = [
  {
    utxo: '1e977694e2413bd0e6105303bb44da60530cafe49b864dde8f8902b021ed86ba#0',
    provider: 'muesliswap_v4',
    from: {quantity: 1000000n, tokenId: '.'},
    to: {
      quantity: 41372n,
      tokenId:
        '2adf188218a66847024664f4f63939577627a56c090f679fe366c5ee.535441424c45',
    },
    deposit: {quantity: 1700000n, tokenId: '.'},
    owner:
      'addr1qxxvt9rzpdxxysmqp50d7f5a3gdescgrejsu7zsdxqjy8yun4cngaq46gr8c9qyz4td9ddajzqhjnrqvfh0gspzv9xnsmq6nqx',
  },
]

const getCompletedOrders: Array<Swap.CompletedOrder> = [
  {
    txHash: '0e56f8d48808e689c1aed60abc158b7aef21c3565a0b766dd89ffba31979414b',
    from: {quantity: 200n, tokenId: '.'},
    to: {
      quantity: 100n,
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
      quantity: 1000n,
    },
    tokenB: {tokenId: '.', quantity: 1000000000n},
    ptPriceTokenA: '0',
    ptPriceTokenB: '0',
    batcherFee: {tokenId: '.', quantity: 0n},
    deposit: {tokenId: '.', quantity: 2000000n},
    poolId:
      '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    lpToken: {tokenId: '.', quantity: 0n},
  },
  amounts: {
    sell: {
      quantity: 1n,
      tokenId:
        'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72.43414b45',
    },
    buy: {quantity: 100n, tokenId: '.'},
  },
  slippage: 1,
  limitPrice: undefined,
}

const getPools: Swap.Pool[] = [
  {
    tokenA: {quantity: 1233807687n, tokenId: '.'},
    tokenB: {
      quantity: 780n,
      tokenId:
        'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72.43414b45',
    },
    ptPriceTokenA: '0',
    ptPriceTokenB: '0',
    deposit: {quantity: 2000000n, tokenId: '.'},
    lpToken: {
      quantity: 981004n,
      tokenId:
        'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    },
    batcherFee: {quantity: 2000000n, tokenId: '.'},
    fee: '0.3',
    poolId:
      '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    provider: 'minswap',
  },
  {
    tokenA: {quantity: 1233807687n, tokenId: '.'},
    tokenB: {
      quantity: 780n,
      tokenId:
        'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72.43414b45',
    },
    ptPriceTokenA: '0',
    ptPriceTokenB: '0',
    deposit: {quantity: 2000000n, tokenId: '.'},
    lpToken: {
      quantity: 981004n,
      tokenId:
        'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    },
    batcherFee: {quantity: 2000000n, tokenId: '.'},
    fee: '0.3',
    poolId:
      '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    provider: 'sundaeswap',
  },
  {
    tokenA: {quantity: 1233807687n, tokenId: '.'},
    tokenB: {
      quantity: 780n,
      tokenId:
        'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72.43414b45',
    },
    ptPriceTokenA: '0',
    ptPriceTokenB: '0',
    deposit: {quantity: 2000000n, tokenId: '.'},
    lpToken: {
      quantity: 981004n,
      tokenId:
        'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    },
    batcherFee: {quantity: 2000000n, tokenId: '.'},
    fee: '0.3',
    poolId:
      '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.7339a8bcda85e2c997d9f16beddbeb3ad755f5202f5cfd9cb08db346a1292c01',
    provider: 'sundaeswap',
  },
]

const getTokenPairs: Array<Portfolio.Token.Info> = [
  {
    application: Portfolio.Token.Application.General,
    nature: Portfolio.Token.Nature.Secondary,
    status: Portfolio.Token.Status.Valid,
    id: '1c1e38cfcc815d2015dbda6bee668b2e707ee3f9d038d96668fcf63c.4567677363617065436c75624561737465725a656e6e79',
    fingerprint: 'asset126v2sm79r8uxvk4ju64mr6srxrvm2x75fpg6w3',
    name: 'EggscapeClubEasterZenny',
    decimals: 0,
    description: 'Eggscape Club Utility Token',
    originalImage: 'ipfs://QmNYibJoiTWRiMmWn4yXwvoakEPgq9WmaukmRXHF1VGbAU',
    type: Portfolio.Token.Type.FT,
    symbol: '',
    ticker: 'EZY',
    tag: '',
    reference: '',
    website: 'https://eggscape.io/',
  },
  {
    application: Portfolio.Token.Application.General,
    nature: Portfolio.Token.Nature.Secondary,
    status: Portfolio.Token.Status.Valid,
    id: 'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354',
    fingerprint: 'asset1yv4fx867hueqt98aqvjw5ncjymz8k3ah8zawcg',
    name: 'CAST',
    decimals: 0,
    description: 'Utility Token for Carda Station Metaverse',
    originalImage:
      'https://tokens.muesliswap.com/static/img/tokens/cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354.png',
    type: Portfolio.Token.Type.FT,
    symbol: '',
    ticker: 'CAST',
    tag: '',
    reference: '',
    website: 'https://cardastation.com',
  },
  {
    application: Portfolio.Token.Application.General,
    nature: Portfolio.Token.Nature.Secondary,
    status: Portfolio.Token.Status.Valid,
    id: 'cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786.52656465656d61626c65',
    fingerprint: 'asset18qw75gcdldlu7q5xh8fjsemgvwffzkg8hatq3s',
    name: 'Redeemable',
    decimals: 4,
    description:
      'The fiat-backed stablecoin issued by Shareslake. Powering the fully stable branch of Cardano.',
    originalImage:
      'https://tokens.muesliswap.com/static/img/tokens/cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786.52656465656d61626c65.png',
    type: Portfolio.Token.Type.FT,
    symbol: '',
    ticker: 'RUSD',
    tag: '',
    reference: '',
    website: 'https://www.shareslake.com',
  },
  {
    application: Portfolio.Token.Application.General,
    nature: Portfolio.Token.Nature.Secondary,
    status: Portfolio.Token.Status.Valid,
    id: '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.4564756c6164646572546f6b656e',
    fingerprint: 'asset1ny2ehvl20cp5y7mmn5qq332sgdncdmsgrcqlwh',
    name: 'EduladderToken',
    decimals: 6,
    description: 'Proof Of Contribution.',
    originalImage:
      'https://tokens.muesliswap.com/static/img/tokens/2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.4564756c6164646572546f6b656e.png',
    type: Portfolio.Token.Type.FT,
    symbol: '',
    ticker: 'ELADR',
    tag: '',
    reference: '',
    website: 'https://eduladder.com',
  },
]

const getTokens: Array<Portfolio.Token.Info> = [
  {
    application: Portfolio.Token.Application.General,
    decimals: 0,
    description: 'Eggscape Club Utility Token',
    fingerprint: 'asset126v2sm79r8uxvk4ju64mr6srxrvm2x75fpg6w3',
    id: '1c1e38cfcc815d2015dbda6bee668b2e707ee3f9d038d96668fcf63c.4567677363617065436c75624561737465725a656e6e79',
    name: 'EggscapeClubEasterZenny',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: 'ipfs://QmNYibJoiTWRiMmWn4yXwvoakEPgq9WmaukmRXHF1VGbAU',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'EZY',
    type: Portfolio.Token.Type.FT,
    website: 'https://eggscape.io/',
  },
  {
    application: Portfolio.Token.Application.General,
    decimals: 0,
    description: 'Utility Token for Carda Station Metaverse',
    fingerprint: 'asset1yv4fx867hueqt98aqvjw5ncjymz8k3ah8zawcg',
    id: 'cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354',
    name: 'CAST',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage:
      'https://tokens.muesliswap.com/static/img/tokens/cdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a.43415354.png',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'CAST',
    type: Portfolio.Token.Type.FT,
    website: 'https://cardastation.com',
  },
  {
    application: Portfolio.Token.Application.General,
    decimals: 4,
    description:
      'The fiat-backed stablecoin issued by Shareslake. Powering the fully stable branch of Cardano.',
    fingerprint: 'asset18qw75gcdldlu7q5xh8fjsemgvwffzkg8hatq3s',
    id: 'cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786.52656465656d61626c65',
    name: 'Redeemable',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage:
      'https://tokens.muesliswap.com/static/img/tokens/cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc6786.52656465656d61626c65.png',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'RUSD',
    type: Portfolio.Token.Type.FT,
    website: 'https://www.shareslake.com',
  },
  {
    application: Portfolio.Token.Application.General,
    decimals: 6,
    description: 'Proof Of Contribution.',
    fingerprint: 'asset1ny2ehvl20cp5y7mmn5qq332sgdncdmsgrcqlwh',
    id: '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.4564756c6164646572546f6b656e',
    name: 'EduladderToken',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage:
      'https://tokens.muesliswap.com/static/img/tokens/2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.4564756c6164646572546f6b656e.png',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'ELADR',
    type: Portfolio.Token.Type.FT,
    website: 'https://eduladder.com',
  },
  {
    application: Portfolio.Token.Application.General,
    decimals: 6,
    description: 'Proof Of Contribution.',
    fingerprint: 'asset1ud7y8pzglxmf68jtww3xhpes9j87akx4mtyx28',
    id: '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.FFFFFF',
    name: 'FFFFFF',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage:
      'https://tokens.muesliswap.com/static/img/tokens/2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.4564756c6164646572546f6b656e.png',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'ELADR',
    type: Portfolio.Token.Type.FT,
    website: 'https://eduladder.com',
  },
  {
    application: Portfolio.Token.Application.General,
    decimals: 6,
    description: 'Proof Of Contribution.',
    fingerprint: 'asset19caqweshdelqqf2u90n7xwxyv5wgsx69aakrce',
    id: '2d420236ffaada336c21e3f4520b799f6e246d8618f2fc89a4907da6.FFFFAA',
    name: 'FFFFAA',
    nature: Portfolio.Token.Nature.Secondary,
    originalImage: '',
    reference: '',
    status: Portfolio.Token.Status.Valid,
    symbol: '',
    tag: '',
    ticker: 'ELAD',
    type: Portfolio.Token.Type.FT,
    website: 'https://eduladder.com',
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
