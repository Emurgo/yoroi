import {App, Chain, Portfolio} from '@yoroi/types'

import {getRecordsSource, portfolioManagerMaker} from './manager'
import {portfolioApiMock} from './adapters/dulahan-api/api-maker.mocks'
import {portfolioStorageMock} from './adapters/mmkv-storage/storage-maker.mocks'
import {createPrimaryTokenInfo} from './helpers/create-primary-token-info'
import {tokenInfoMocks} from './adapters/token-info.mocks'
import {portfolioStorageMaker} from './adapters/mmkv-storage/storage-maker'
import {mountMMKVStorage, observableStorageMaker} from '@yoroi/common'
import {PortfolioStorage} from './types'
import {tokenBalanceMocks} from './adapters/token-balance.mocks'
import {tokenDiscoveryMocks} from './adapters/token-discovery.mocks'

describe('portfolioManagerMaker', () => {
  const primaryTokenInfo = createPrimaryTokenInfo({
    decimals: 6,
    name: 'Cardano',
    reference: 'ADA',
    originalImage: 'https://example.com/ada.png',
    symbol: 'ADA',
    tag: '',
    ticker: 'ADA',
    website: 'https://example.com',
  })
  it('should be instantiated', () => {
    const portfolioManager = portfolioManagerMaker({
      network: Chain.Network.Main,
      api: portfolioApiMock.success,
      storage: portfolioStorageMock,
      primaryTokenInfo,
    })

    expect(portfolioManager).toBeDefined()
  })
})

describe('getRecordsSource', () => {
  it('should return an empty array when newIds is empty', () => {
    const newIds: Portfolio.Token.Id[] = []
    const cachedInfos = new Map<Portfolio.Token.Id, App.CacheInfo>([
      [
        tokenInfoMocks.nftCryptoKitty.id,
        {expires: 1635724800000, hash: 'hash1'},
      ],
    ])

    const {toFetch, fromCache} = getRecordsSource({newIds, cachedInfos})

    expect(toFetch).toEqual([])
    expect(fromCache).toEqual([])
  })

  it('should return an array of records to fetch when newIds are not cached', () => {
    const {nftCryptoKitty, rnftWhatever} = tokenInfoMocks
    const newIds: Portfolio.Token.Id[] = [nftCryptoKitty.id, rnftWhatever.id]
    const cachedInfos = new Map<Portfolio.Token.Id, App.CacheInfo>()

    const {toFetch, fromCache} = getRecordsSource({newIds, cachedInfos})

    expect(toFetch).toEqual([
      [nftCryptoKitty.id, ''],
      [rnftWhatever.id, ''],
    ])
    expect(fromCache).toEqual([])
  })

  it('should return an array of records to fetch when newIds are expired', () => {
    const {nftCryptoKitty, rnftWhatever} = tokenInfoMocks
    const newIds: Portfolio.Token.Id[] = [nftCryptoKitty.id, rnftWhatever.id]
    const past = Date.now() - 1000000
    const future = Date.now() + 1000000
    const cachedInfos = new Map<Portfolio.Token.Id, App.CacheInfo>([
      [nftCryptoKitty.id, {expires: past, hash: 'hash1'}],
      [rnftWhatever.id, {expires: future, hash: 'hash2'}],
    ])

    const {toFetch, fromCache} = getRecordsSource({newIds, cachedInfos})

    expect(toFetch).toEqual([[nftCryptoKitty.id, 'hash1']])
    expect(fromCache).toEqual([rnftWhatever.id])
  })

  it('should return an empty array when all newIds are not expired', () => {
    const {nftCryptoKitty, rnftWhatever} = tokenInfoMocks
    const newIds: Portfolio.Token.Id[] = [nftCryptoKitty.id, rnftWhatever.id]
    const future = Date.now() + 1000000
    const cachedInfos = new Map<Portfolio.Token.Id, App.CacheInfo>([
      [nftCryptoKitty.id, {expires: future, hash: 'hash1'}],
      [rnftWhatever.id, {expires: future, hash: 'hash2'}],
    ])

    const {toFetch, fromCache} = getRecordsSource({newIds, cachedInfos})

    expect(toFetch).toEqual([])
    expect(fromCache).toEqual([nftCryptoKitty.id, rnftWhatever.id])
  })
})

describe('sync', () => {
  const primaryTokenInfo = createPrimaryTokenInfo({
    decimals: 6,
    name: 'Cardano',
    reference: 'ADA',
    originalImage: 'https://example.com/ada.png',
    symbol: 'ADA',
    tag: '',
    ticker: 'ADA',
    website: 'https://example.com',
  })

  const tokenDiscoveryStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>(
      '/tmp/token-discovery/',
      'token-discovery',
    ),
  )
  const tokenInfoStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>('/tmp/token-info/', 'token-info'),
  )
  const balanceStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>('/tmp/balance/', 'balance'),
  )
  const primaryBreakdownStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>(
      '/tmp/primary-balance-breakdown/',
      'primary-balance-breakdown',
    ),
  )
  const storage: PortfolioStorage = portfolioStorageMaker({
    tokenDiscoveryStorage,
    tokenInfoStorage,
    balanceStorage,
    primaryBreakdownStorage,
  })

  afterEach(() => {
    storage.clear()
  })

  it('should sync the balances and token infos', async () => {
    const portfolioManager = portfolioManagerMaker({
      network: Chain.Network.Main,
      api: portfolioApiMock.success,
      storage,
      primaryTokenInfo,
    })

    const primaryBalance: Readonly<
      Omit<Portfolio.BalancePrimaryBreakdown, 'info'>
    > = {
      balance: BigInt(1000000),
      lockedInBuiltTxs: BigInt(0),
      minRequiredByTokens: BigInt(0),
      records: [],
    }
    const secondaryBalances: Readonly<
      Map<Portfolio.Token.Id, Portfolio.Token.Balance>
    > = new Map([])

    await portfolioManager.sync({primaryBalance, secondaryBalances})

    expect(portfolioManager.getPrimaryBreakdown()).toEqual({
      info: primaryTokenInfo,
      balance: BigInt(1000000),
      lockedInBuiltTxs: BigInt(0),
      minRequiredByTokens: BigInt(0),
      records: [],
    })
  })
})

describe('hydrate', () => {
  const primaryTokenInfo = createPrimaryTokenInfo({
    decimals: 6,
    name: 'Cardano',
    reference: 'ADA',
    originalImage: 'https://example.com/ada.png',
    symbol: 'ADA',
    tag: '',
    ticker: 'ADA',
    website: 'https://example.com',
  })

  const tokenDiscoveryStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>(
      '/tmp/token-discovery/',
      'token-discovery',
    ),
  )
  const tokenInfoStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>('/tmp/token-info/', 'token-info'),
  )
  const balanceStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>('/tmp/balance/', 'balance'),
  )
  const primaryBreakdownStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>(
      '/tmp/primary-balance-breakdown/',
      'primary-balance-breakdown',
    ),
  )
  const storage: PortfolioStorage = portfolioStorageMaker({
    tokenDiscoveryStorage,
    tokenInfoStorage,
    balanceStorage,
    primaryBreakdownStorage,
  })

  afterEach(() => {
    storage.clear()
  })

  const primaryBalance: Readonly<Portfolio.BalancePrimaryBreakdown> = {
    info: primaryTokenInfo,
    balance: BigInt(1000000),
    lockedInBuiltTxs: BigInt(0),
    minRequiredByTokens: BigInt(0),
    records: [],
  }

  storage.primaryBalanceBreakdown.save(primaryBalance)
  storage.token.infos.save(tokenInfoMocks.storage.entries1)
  storage.token.discoveries.save(tokenDiscoveryMocks.storage.entries1)
  storage.balances.save(tokenBalanceMocks.storage.entries1)

  it('should hydrate data', async () => {
    const portfolioManager = portfolioManagerMaker({
      network: Chain.Network.Main,
      api: portfolioApiMock.success,
      storage,
      primaryTokenInfo,
    })
    const subscriber = jest.fn()
    portfolioManager.observer.subscribe(subscriber)

    portfolioManager.hydrate()

    expect(portfolioManager.getPrimaryBreakdown()).toEqual(primaryBalance)
    expect(portfolioManager.getBalances()).toEqual(
      tokenBalanceMocks.storage.entries1,
    )

    expect(subscriber).toHaveBeenCalledTimes(1)
  })
})
