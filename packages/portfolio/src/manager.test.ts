import {App, Chain, Portfolio} from '@yoroi/types'

import {portfolioManagerMaker} from './manager'
import {portfolioApiMock} from './adapters/dulahan-api/api-maker.mocks'
import {portfolioStorageMock} from './adapters/mmkv-storage/storage-maker.mocks'
import {createPrimaryTokenInfo} from './helpers/create-primary-token-info'

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
import {getRecordsToFetch} from './manager'
import {tokenInfoMocks} from './adapters/token-info.mocks'

describe('getRecordsToFetch', () => {
  it('should return an empty array when newIds is empty', () => {
    const newIds: Portfolio.Token.Id[] = []
    const cachedInfos = new Map<Portfolio.Token.Id, App.CacheInfo>([
      [
        tokenInfoMocks.nftCryptoKitty.id,
        {expires: 1635724800000, hash: 'hash1'},
      ],
    ])

    const {toFetch, fromCache} = getRecordsToFetch({newIds, cachedInfos})

    expect(toFetch).toEqual([])
    expect(fromCache).toEqual([])
  })

  it('should return an array of records to fetch when newIds are not cached', () => {
    const {nftCryptoKitty, rnftWhatever} = tokenInfoMocks
    const newIds: Portfolio.Token.Id[] = [nftCryptoKitty.id, rnftWhatever.id]
    const cachedInfos = new Map<Portfolio.Token.Id, App.CacheInfo>()

    const {toFetch, fromCache} = getRecordsToFetch({newIds, cachedInfos})

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

    const {toFetch, fromCache} = getRecordsToFetch({newIds, cachedInfos})

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

    const {toFetch, fromCache} = getRecordsToFetch({newIds, cachedInfos})

    expect(toFetch).toEqual([])
    expect(fromCache).toEqual([nftCryptoKitty.id, rnftWhatever.id])
  })
})
