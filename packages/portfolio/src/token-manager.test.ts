import {mountMMKVStorage, observableStorageMaker} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'

import {portfolioTokenManagerMaker} from './token-manager'
import {portfolioTokenStorageMaker} from './adapters/mmkv-storage/token-storage-maker'
import {portfolioApiMock} from './adapters/dullahan-api/api-maker.mocks'
import {tokenInfoMocks} from './adapters/token-info.mocks'
import {createCachedUnknownTokenInfo} from './helpers/create-cached-unknown-token-info'

describe('portfolioTokenManagerMaker', () => {
  const tokenInfoStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: `/test/token-info/`,
    }),
  )
  const tokenDiscoveryStorage = observableStorageMaker(
    mountMMKVStorage<Portfolio.Token.Id>({
      path: `/test/token-discovery/`,
    }),
  )
  const storage = portfolioTokenStorageMaker({
    tokenInfoStorage,
    tokenDiscoveryStorage,
  })

  afterEach(() => {
    jest.resetAllMocks()
    storage.clear()
  })

  it('should hydrate the cache', () => {
    const api = portfolioApiMock.success
    const manager = portfolioTokenManagerMaker({api, storage})
    const subscriber = jest.fn()
    manager.subscribe(subscriber)

    manager.hydrate({sourceId: 'sourceId'})

    expect(subscriber).toHaveBeenCalledTimes(1)
    expect(subscriber).toHaveBeenCalledWith({
      on: Portfolio.Event.ManagerOn.Hydrate,
      sourceId: 'sourceId',
    })
  })

  it('should sync token infos with unknowns', async () => {
    storage.token.infos.save(tokenInfoMocks.storage.notModified)
    const api = portfolioApiMock.success
    const manager = portfolioTokenManagerMaker({api, storage})
    const unknownTokenId: Portfolio.Token.Id = 'unknown.id'
    const secondaryTokenIds = [
      tokenInfoMocks.rnftWhatever.id,
      tokenInfoMocks.nftCryptoKitty.id,
      unknownTokenId,
    ]
    manager.hydrate({sourceId: 'sourceId'})
    const subscriber = jest.fn()
    manager.subscribe(subscriber)
    const unknownCachedTokenInfo = createCachedUnknownTokenInfo(unknownTokenId)

    const result = await manager.sync({secondaryTokenIds, sourceId: 'sourceId'})

    expect(subscriber).toHaveBeenCalledTimes(1)
    expect(subscriber).toHaveBeenCalledWith({
      on: Portfolio.Event.ManagerOn.Sync,
      ids: expect.arrayContaining(secondaryTokenIds.slice(1)),
      sourceId: 'sourceId',
    })

    expect(result.size).toBe(3)

    // should update the stale cache records with api data and refresh cache info
    const resultNftCryptoKitty = result.get(tokenInfoMocks.nftCryptoKitty.id)
    if (!resultNftCryptoKitty) fail()
    expect(resultNftCryptoKitty.expires).toBeGreaterThan(Date.now())
    expect(resultNftCryptoKitty.hash).toBe('hash2-1')
    expect(resultNftCryptoKitty.record).toEqual(tokenInfoMocks.nftCryptoKitty)

    // should create unknown token info when api doesn't return it
    // creates expired so it will always hit the api when syncing
    const resultUnknownToken = result.get(unknownTokenId)
    if (!resultUnknownToken) fail()
    expect(resultUnknownToken.expires).toBe(0)
    expect(resultUnknownToken.hash).toBe('')
    expect(resultUnknownToken.record).toEqual(unknownCachedTokenInfo.record)

    // should return the cached record when api returns NotModified
    // yet, should update the expires but not the hash
    const resultRnftWhatever = result.get(tokenInfoMocks.rnftWhatever.id)
    if (!resultRnftWhatever) fail()
    expect(resultRnftWhatever.expires).toBeGreaterThan(Date.now())
    expect(resultRnftWhatever.hash).toBe('hash3')
    expect(resultRnftWhatever.record).toEqual(tokenInfoMocks.rnftWhatever)

    manager.destroy()
  })

  it('should read all from cache', async () => {
    storage.token.infos.save(tokenInfoMocks.storage.cached)
    const api = portfolioApiMock.success
    const manager = portfolioTokenManagerMaker({api, storage})
    const secondaryTokenIds = [tokenInfoMocks.rnftWhatever.id]

    const result = await manager.sync({secondaryTokenIds, sourceId: 'sourceId'})

    expect(result.size).toBe(1)

    // should return the cached record and not hit the api
    const resultRnftWhatever = result.get(tokenInfoMocks.rnftWhatever.id)
    if (!resultRnftWhatever) fail()
    expect(resultRnftWhatever.expires).toBeGreaterThan(Date.now())
    expect(resultRnftWhatever.hash).toBe('hash3')
    expect(resultRnftWhatever.record).toEqual(tokenInfoMocks.rnftWhatever)
  })

  it('should create as unknwon when api error', async () => {
    const api = portfolioApiMock.error
    const manager = portfolioTokenManagerMaker({api, storage})
    const secondaryTokenIds = [tokenInfoMocks.rnftWhatever.id]
    const unknownCachedTokenInfo = createCachedUnknownTokenInfo(
      tokenInfoMocks.rnftWhatever.id,
    )

    const result = await manager.sync({secondaryTokenIds, sourceId: 'sourceId'})

    expect(result.size).toBe(1)

    // should return the unknown record
    const resultRnftWhatever = result.get(tokenInfoMocks.rnftWhatever.id)
    if (!resultRnftWhatever) fail()
    expect(resultRnftWhatever).toEqual(unknownCachedTokenInfo)
  })

  it('should call destroy (coverage) observer is not exposed', () => {
    const api = portfolioApiMock.success
    const manager = portfolioTokenManagerMaker({api, storage})

    manager.destroy()
  })

  it('should revalidate cache', async () => {
    const api = portfolioApiMock.success
    storage.token.infos.save(tokenInfoMocks.storage.notModified)
    const manager = portfolioTokenManagerMaker({api, storage})
    const secondaryTokenIds = [tokenInfoMocks.rnftWhatever.id]

    const result = await manager.sync({secondaryTokenIds, sourceId: 'sourceId'})

    expect(result.size).toBe(1)

    // should return the unknown record
    const resultRnftWhatever = result.get(tokenInfoMocks.rnftWhatever.id)
    if (!resultRnftWhatever) fail()
    expect(resultRnftWhatever.expires).toBeGreaterThan(Date.now())
    expect(resultRnftWhatever.hash).toBe('hash3')
    expect(resultRnftWhatever.record).toEqual(tokenInfoMocks.rnftWhatever)
  })

  it('should sync empty', async () => {
    const api = portfolioApiMock.success
    storage.token.infos.save(tokenInfoMocks.storage.notModified)
    const manager = portfolioTokenManagerMaker({api, storage})
    const secondaryTokenIds: Portfolio.Token.Id[] = []

    const result = await manager.sync({secondaryTokenIds, sourceId: 'sourceId'})

    expect(result.size).toBe(0)
  })

  it('should sync empty to revalidate', async () => {
    const api = portfolioApiMock.success
    const manager = portfolioTokenManagerMaker({api, storage})
    const secondaryTokenIds: Portfolio.Token.Id[] = [
      tokenInfoMocks.rnftWhatever.id,
    ]
    const unknownCachedTokenInfo = createCachedUnknownTokenInfo(
      tokenInfoMocks.rnftWhatever.id,
    )

    const result = await manager.sync({secondaryTokenIds, sourceId: 'sourceId'})

    expect(result.size).toBe(1)
    const resultRnftWhatever = result.get(tokenInfoMocks.rnftWhatever.id)
    if (!resultRnftWhatever) fail()
    expect(resultRnftWhatever).toEqual(unknownCachedTokenInfo)
  })

  it('should clear all data in the storage', async () => {
    const api = portfolioApiMock.success
    const manager = portfolioTokenManagerMaker({api, storage})
    const secondaryTokenIds: Portfolio.Token.Id[] = [
      tokenInfoMocks.rnftWhatever.id,
    ]

    await manager.sync({secondaryTokenIds, sourceId: 'sourceId'})

    expect(
      storage.token.infos.read([tokenInfoMocks.rnftWhatever.id]).length,
    ).toBe(1)

    const subscriber = jest.fn()
    manager.subscribe(subscriber)

    manager.clear({sourceId: 'sourceId'})

    expect(storage.token.infos.all().length).toBe(0)

    expect(subscriber).toHaveBeenCalledWith({
      on: Portfolio.Event.ManagerOn.Clear,
      sourceId: 'sourceId',
    })

    manager.destroy()
  })
})
