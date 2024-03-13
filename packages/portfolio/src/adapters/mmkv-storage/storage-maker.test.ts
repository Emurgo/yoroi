import {cacheRecordMaker, storageSerializer} from '@yoroi/common'
import {App, Portfolio} from '@yoroi/types'

import {portfolioStorageMaker} from './storage-maker' // Adjust the path accordingly
import {tokenMocks} from '../token.mocks'
import {deserializers} from '../../transformers/deserializers'
import {tokenBalanceMocks} from '../token-balance.mocks'
import {tokenDiscoveryMocks} from '../token-discovery.mocks'
import {tokenInfoMocks} from '../token-info.mocks'

describe('portfolioStorageMaker', () => {
  let tokenInfoStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  let tokenDiscoveryStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  let balanceStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  let primaryBreakdownStorage: App.ObservableStorage<false, Portfolio.Token.Id>

  beforeEach(() => {
    tokenInfoStorage = createMockStorage('v2/mainnet/token-info/')
    tokenDiscoveryStorage = createMockStorage(
      'v2/mainnet/token-discovery/',
      deserializers.tokenDiscoveryWithCache,
    )
    balanceStorage = createMockStorage(
      'v2/wallets/id/balance/',
      deserializers.tokenBalance,
    )
    primaryBreakdownStorage = createMockStorage(
      'v2/wallets/id/primary-breakdown/',
      deserializers.primaryBreakdown,
    )

    tokenInfoStorage.clear()
    tokenDiscoveryStorage.clear()
    balanceStorage.clear()
    primaryBreakdownStorage.clear()

    jest.clearAllMocks()
  })

  it('should instantiate storage', () => {
    const storage = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
      primaryBreakdownStorage,
    })

    expect(storage).toBeDefined()
    expect(Object.isFrozen(storage)).toBe(true)
  })

  it('should save token info entries', () => {
    const nftCryptoKitty = tokenMocks.nftCryptoKitty.info
    const primaryETH = tokenMocks.primaryETH.info

    const {token} = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
      primaryBreakdownStorage,
    })

    const entries: ReadonlyArray<
      [Portfolio.Token.Id, App.CacheRecord<Portfolio.Token.Info>]
    > = [
      [
        nftCryptoKitty.id,
        cacheRecordMaker({expires: 0, hash: ''}, nftCryptoKitty),
      ],
      [primaryETH.id, cacheRecordMaker({expires: 0, hash: ''}, primaryETH)],
    ] as const

    token.infos.save(entries)

    expect(tokenInfoStorage.multiSet).toHaveBeenCalledWith(
      entries,
      storageSerializer,
    )
  })

  it('should read token info entries', () => {
    const nftCryptoKitty = tokenMocks.nftCryptoKitty.info
    const primaryETH = tokenMocks.primaryETH.info

    const {token} = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
      primaryBreakdownStorage,
    })

    const entries: ReadonlyArray<
      [Portfolio.Token.Id, App.CacheRecord<Portfolio.Token.Info>]
    > = [
      [
        nftCryptoKitty.id,
        cacheRecordMaker({expires: 0, hash: ''}, nftCryptoKitty),
      ],
      [primaryETH.id, cacheRecordMaker({expires: 0, hash: ''}, primaryETH)],
    ] as const

    token.infos.save(entries)

    const keys = [nftCryptoKitty.id, primaryETH.id]
    const result = token.infos.read(keys)

    expect(result).toEqual(entries)
    expect(tokenInfoStorage.multiGet).toHaveBeenCalledWith(keys)
  })

  it('should save token discovery entries', () => {
    const nftCryptoKitty = tokenMocks.nftCryptoKitty.discovery
    const primaryETH = tokenMocks.primaryETH.discovery

    const {token} = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
      primaryBreakdownStorage,
    })

    const entries: ReadonlyArray<
      [Portfolio.Token.Id, App.CacheRecord<Portfolio.Token.Discovery>]
    > = [
      [
        nftCryptoKitty.id,
        cacheRecordMaker({expires: 0, hash: ''}, nftCryptoKitty),
      ],
      [primaryETH.id, cacheRecordMaker({expires: 0, hash: ''}, primaryETH)],
    ] as const

    token.discoveries.save(entries)

    expect(tokenDiscoveryStorage.multiSet).toHaveBeenCalledWith(
      entries,
      storageSerializer,
    )
  })

  it('should save balances entries', () => {
    const {balances} = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
      primaryBreakdownStorage,
    })

    balances.save(tokenBalanceMocks.storage.entries1)

    expect(balanceStorage.multiSet).toHaveBeenCalledWith(
      tokenBalanceMocks.storage.entries1,
      storageSerializer,
    )
  })

  it('should read balances entries', () => {
    const nftCryptoKitty = tokenMocks.nftCryptoKitty.info
    const rnftWhatever = tokenMocks.rnftWhatever.info

    const {balances} = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
      primaryBreakdownStorage,
    })

    balances.save(tokenBalanceMocks.storage.entries1)

    const keys = [nftCryptoKitty.id, rnftWhatever.id]
    const result = balances.read(keys)

    expect(result).toEqual([
      [nftCryptoKitty.id, tokenBalanceMocks.nftCryptoKitty],
      [rnftWhatever.id, tokenBalanceMocks.rnftWhatever],
    ])
    expect(balanceStorage.multiGet).toHaveBeenCalledWith(
      keys,
      deserializers.tokenBalance,
    )
  })

  it('should read token discovery entries', () => {
    const nftCryptoKitty = tokenMocks.nftCryptoKitty.discovery
    const primaryETH = tokenMocks.primaryETH.discovery
    const rnftWhatever = tokenMocks.rnftWhatever.discovery

    const {token} = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
      primaryBreakdownStorage,
    })

    token.discoveries.save(tokenDiscoveryMocks.storage.entries1)

    const keys = [primaryETH.id, nftCryptoKitty.id, rnftWhatever.id]
    const result = token.discoveries.read(keys)

    expect(result).toEqual(tokenDiscoveryMocks.storage.entries1)
    expect(tokenDiscoveryStorage.multiGet).toHaveBeenCalledWith(
      keys,
      deserializers.tokenDiscoveryWithCache,
    )
  })

  it('should clear all portfolio records', () => {
    const {token, clear, balances, primaryBalanceBreakdown} =
      portfolioStorageMaker({
        tokenInfoStorage,
        tokenDiscoveryStorage,
        balanceStorage,
        primaryBreakdownStorage,
      })

    token.discoveries.save(tokenDiscoveryMocks.storage.entries1)
    token.infos.save(tokenInfoMocks.storage.entries1)
    balances.save(tokenBalanceMocks.storage.entries1)
    primaryBalanceBreakdown.save(tokenBalanceMocks.primaryETHBreakdown)

    let infoResult = token.infos.all()
    let dicoveryResult = token.discoveries.all()
    let balanceResult = balances.all()
    let primaryBreakdownResult = primaryBalanceBreakdown.read(
      tokenInfoMocks.primaryETH.id,
    )

    expect(infoResult).toEqual(tokenInfoMocks.storage.entries1)
    expect(dicoveryResult).toEqual(tokenDiscoveryMocks.storage.entries1)
    expect(balanceResult).toEqual(tokenBalanceMocks.storage.entries1)
    expect(primaryBreakdownResult).toEqual(
      tokenBalanceMocks.primaryETHBreakdown,
    )

    clear()

    infoResult = token.infos.all()
    dicoveryResult = token.discoveries.all()
    balanceResult = balances.all()
    primaryBreakdownResult = primaryBalanceBreakdown.read(
      tokenInfoMocks.primaryETH.id,
    )

    // keys are gone
    expect(infoResult).toEqual([])
    expect(dicoveryResult).toEqual([])
    expect(balanceResult).toEqual([])
    expect(primaryBreakdownResult).toEqual(null)

    expect(tokenDiscoveryStorage.clear).toHaveBeenCalled()
    expect(tokenInfoStorage.clear).toHaveBeenCalled()
    expect(balanceStorage.clear).toHaveBeenCalled()
    expect(primaryBreakdownStorage.clear).toHaveBeenCalled()
  })

  it('should return all keys', () => {
    const {token, balances, primaryBalanceBreakdown} = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
      primaryBreakdownStorage,
    })

    token.discoveries.save(tokenDiscoveryMocks.storage.entries1)
    token.infos.save(tokenInfoMocks.storage.entries1)
    balances.save(tokenBalanceMocks.storage.entries1)
    primaryBalanceBreakdown.save(tokenBalanceMocks.primaryETHBreakdown)

    let infoResult = token.infos.keys()
    let dicoveryResult = token.discoveries.keys()
    let balanceResult = balances.keys()

    expect(infoResult).toEqual([
      ...new Map(tokenInfoMocks.storage.entries1).keys(),
    ])
    expect(dicoveryResult).toEqual([
      ...new Map(tokenDiscoveryMocks.storage.entries1).keys(),
    ])
    expect(balanceResult).toEqual([
      ...new Map(tokenBalanceMocks.storage.entries1).keys(),
    ])
  })

  it('should call clear', () => {
    const {token, balances, primaryBalanceBreakdown} = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
      primaryBreakdownStorage,
    })

    token.discoveries.clear()
    token.infos.clear()
    balances.clear()
    primaryBalanceBreakdown.clear()

    expect(tokenDiscoveryStorage.clear).toHaveBeenCalled()
    expect(tokenInfoStorage.clear).toHaveBeenCalled()
    expect(balanceStorage.clear).toHaveBeenCalled()
    expect(primaryBreakdownStorage.clear).toHaveBeenCalled()
  })
})

function createMockStorage<K extends string = string>(
  path: App.StorageFolderName = '/',
  deserializer = JSON.parse,
  serializer = storageSerializer,
  storage = new Map(),
  subscriptions = new Set(),
): App.ObservableStorage<false, K> {
  const withPath = (key: string) => `${path}${key}`

  return {
    join: jest.fn((folderName: App.StorageFolderName) =>
      createMockStorage(
        `${path}${folderName}`,
        deserializer,
        serializer,
        storage,
        subscriptions,
      ),
    ),
    getItem: jest.fn((key, parser = deserializer as any) => {
      const item = storage.get(withPath(key)) ?? null
      return parser(item)
    }),
    multiGet: jest.fn((keys, parser = deserializer as any) => {
      return keys.map((key) => [
        key,
        parser(storage.get(withPath(key)) ?? null),
      ])
    }),
    setItem: jest.fn((key, value, stringifier = serializer) => {
      storage.set(withPath(key), stringifier(value))
    }),
    multiSet: jest.fn((tuples, stringifier = serializer) => {
      tuples.forEach(([key, value]) => {
        storage.set(withPath(key), stringifier(value))
      })
    }),
    removeItem: jest.fn((key) => {
      storage.delete(withPath(key))
    }),
    removeFolder: jest.fn((folderName: App.StorageFolderName) => {
      const prefix = `${path}${folderName}`
      const keysToRemove = [...storage.keys()].filter((key) =>
        key.startsWith(prefix),
      )
      keysToRemove.forEach((key) => storage.delete(key))
    }),
    multiRemove: jest.fn((keys) => {
      keys.forEach((key: string) => storage.delete(withPath(key)))
    }),
    getAllKeys: jest.fn(() => {
      const withoutPath = (absolutePath: string) =>
        absolutePath.slice(path.length)
      return [...storage.keys()]
        .filter((key) => key.startsWith(path))
        .map((key) => withoutPath(key)) as unknown as ReadonlyArray<any>
    }),
    clear: jest.fn(() => {
      storage.clear()
    }),
    onUpdate: jest.fn((_keysToObserve, callback) => {
      subscriptions.add(callback)

      return jest.fn(() => {
        subscriptions.delete(callback)
      })
    }),
  }
}
