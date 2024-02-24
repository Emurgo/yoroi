import {cacheRecordMaker} from '@yoroi/common'
import {App, Portfolio} from '@yoroi/types'

import {portfolioStorageMaker} from '../mmkv-storage/mmkv-storage' // Adjust the path accordingly
import {tokenMocks} from '../token.mocks'
import {balanceMocks} from '../balance.mocks'

describe('portfolioStorageMaker', () => {
  let tokenInfoStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  let tokenDiscoveryStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  let balanceStorage: App.ObservableStorage<false, Portfolio.Token.Id>

  beforeEach(() => {
    tokenInfoStorage = createMockStorage('/tokenInfo/')
    tokenDiscoveryStorage = createMockStorage('/tokenDiscovery/')
    balanceStorage = createMockStorage('/wallet/')

    tokenInfoStorage.clear()
    tokenDiscoveryStorage.clear()
    balanceStorage.clear()

    jest.clearAllMocks()
  })

  it('should instantiate storage', () => {
    const storage = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
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

    expect(tokenInfoStorage.multiSet).toHaveBeenCalledWith(entries)
  })

  it('should read token info entries', () => {
    const nftCryptoKitty = tokenMocks.nftCryptoKitty.info
    const primaryETH = tokenMocks.primaryETH.info

    const {token} = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
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

    expect(tokenDiscoveryStorage.multiSet).toHaveBeenCalledWith(entries)
  })

  it('should save balances entries', () => {
    const nftCryptoKitty = tokenMocks.nftCryptoKitty.info
    const primaryETH = tokenMocks.primaryETH.info

    const {balances} = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
    })

    const entries: ReadonlyArray<[Portfolio.Token.Id, Portfolio.Token.Info]> = [
      [nftCryptoKitty.id, balanceMocks.tokens1[nftCryptoKitty.id]],
      [primaryETH.id, balanceMocks[primaryETH.id]],
    ] as const

    balances.save(entries)

    expect(balanceStorage.multiSet).toHaveBeenCalledWith(entries)
  })

  it('should read balances entries', () => {
    const nftCryptoKitty = tokenMocks.nftCryptoKitty.info
    const primaryETH = tokenMocks.primaryETH.info

    const {balances} = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
    })

    const entries: ReadonlyArray<[Portfolio.Token.Id, Portfolio.Token.Info]> = [
      [nftCryptoKitty.id, nftCryptoKitty],
      [primaryETH.id, primaryETH],
    ] as const

    balances.save(entries)

    const keys = [nftCryptoKitty.id, primaryETH.id]
    const result = balances.read(keys)

    expect(result).toEqual(entries)
    expect(balanceStorage.multiGet).toHaveBeenCalledWith(keys)
  })

  it('should read token discovery entries', () => {
    const nftCryptoKitty = tokenMocks.nftCryptoKitty.discovery
    const primaryETH = tokenMocks.primaryETH.discovery

    const {token} = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
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

    const keys = [nftCryptoKitty.id, primaryETH.id]
    const result = token.discoveries.read(keys)

    expect(result).toEqual(entries)
    expect(tokenDiscoveryStorage.multiGet).toHaveBeenCalledWith(keys)
  })

  it('should clear all portfolio records', () => {
    const {nftCryptoKitty, primaryETH} = tokenMocks

    const {token, clear} = portfolioStorageMaker({
      tokenInfoStorage,
      tokenDiscoveryStorage,
      balanceStorage,
    })

    const discoveryEntries: ReadonlyArray<
      [Portfolio.Token.Id, App.CacheRecord<Portfolio.Token.Discovery>]
    > = [
      [
        nftCryptoKitty.discovery.id,
        cacheRecordMaker({expires: 0, hash: ''}, nftCryptoKitty.discovery),
      ],
      [
        primaryETH.discovery.id,
        cacheRecordMaker({expires: 0, hash: ''}, primaryETH.discovery),
      ],
    ] as const

    token.discoveries.save(discoveryEntries)

    const infoEntries: ReadonlyArray<
      [Portfolio.Token.Id, App.CacheRecord<Portfolio.Token.Info>]
    > = [
      [
        nftCryptoKitty.info.id,
        cacheRecordMaker({expires: 0, hash: ''}, nftCryptoKitty.info),
      ],
      [
        primaryETH.info.id,
        cacheRecordMaker({expires: 0, hash: ''}, primaryETH.info),
      ],
    ] as const

    token.infos.save(infoEntries)

    const infoKeys = [nftCryptoKitty.info.id, primaryETH.info.id]
    const discoveryKeys = [nftCryptoKitty.discovery.id, primaryETH.discovery.id]

    let infoResult = token.infos.read(infoKeys)
    let dicoveryResult = token.discoveries.read(discoveryKeys)

    expect(infoResult).toEqual(infoEntries)
    expect(dicoveryResult).toEqual(discoveryEntries)

    clear()

    infoResult = token.infos.read(infoKeys)
    dicoveryResult = token.discoveries.read(discoveryKeys)

    expect(infoResult).toEqual([
      [nftCryptoKitty.info.id, null],
      [primaryETH.info.id, null],
    ])
    expect(dicoveryResult).toEqual([
      [nftCryptoKitty.discovery.id, null],
      [primaryETH.discovery.id, null],
    ])

    expect(tokenDiscoveryStorage.clear).toHaveBeenCalled()
    expect(tokenInfoStorage.clear).toHaveBeenCalled()
  })
})

// NOTE: considering exporting from common as mocked storage
function createMockStorage<K extends string = string>(
  path: App.StorageFolderName = '/',
  storage = new Map(),
  subscriptions = new Set(),
): App.ObservableStorage<false, K> {
  const withPath = (key: string) => `${path}${key}`

  return {
    join: jest.fn((folderName: App.StorageFolderName) =>
      createMockStorage(`${path}${folderName}`, storage, subscriptions),
    ),
    getItem: jest.fn((key, parse = JSON.parse as any) => {
      const item = storage.get(withPath(key)) ?? null
      return parse(item)
    }),
    multiGet: jest.fn((keys, parse = JSON.parse as any) => {
      return keys.map((key) => [key, parse(storage.get(withPath(key)) ?? null)])
    }),
    setItem: jest.fn((key, value, stringify = JSON.stringify) => {
      storage.set(withPath(key), stringify(value))
    }),
    multiSet: jest.fn((tuples, stringify = JSON.stringify) => {
      tuples.forEach(([key, value]) => {
        storage.set(withPath(key), stringify(value))
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
        .map((key) => withoutPath(key))
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
