import {cacheRecordMaker, storageSerializer} from '@yoroi/common'
import {App, Portfolio} from '@yoroi/types'

import {portfolioTokenStorageMaker} from './token-storage-maker' // Adjust the path accordingly
import {tokenMocks} from '../token.mocks'
import {tokenInfoMocks} from '../token-info.mocks'

describe('portfolioTokenStorageMaker', () => {
  let tokenInfoStorage: App.ObservableStorage<false, Portfolio.Token.Id>

  beforeEach(() => {
    tokenInfoStorage = createMockStorage('v2/mainnet/token-info/')

    tokenInfoStorage.clear()

    jest.clearAllMocks()
  })

  it('should instantiate storage', () => {
    const storage = portfolioTokenStorageMaker({
      tokenInfoStorage,
    })

    expect(storage).toBeDefined()
    expect(Object.isFrozen(storage)).toBe(true)
  })

  it('should save token info entries', () => {
    const nftCryptoKitty = tokenMocks.nftCryptoKitty.info
    const primaryETH = tokenMocks.primaryETH.info

    const {token} = portfolioTokenStorageMaker({
      tokenInfoStorage,
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

    const {token} = portfolioTokenStorageMaker({
      tokenInfoStorage,
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

  it('should clear all portfolio records', () => {
    const {token, clear} = portfolioTokenStorageMaker({
      tokenInfoStorage,
    })

    token.infos.save(tokenInfoMocks.storage.entries1)

    let infoResult = token.infos.all()

    expect(infoResult).toEqual(tokenInfoMocks.storage.entries1)

    clear()

    infoResult = token.infos.all()

    // keys are gone
    expect(infoResult).toEqual([])

    expect(tokenInfoStorage.clear).toHaveBeenCalled()
  })

  it('should return all keys', () => {
    const {token} = portfolioTokenStorageMaker({
      tokenInfoStorage,
    })

    token.infos.save(tokenInfoMocks.storage.entries1)

    let infoResult = token.infos.keys()

    expect(infoResult).toEqual([
      ...new Map(tokenInfoMocks.storage.entries1).keys(),
    ])
  })

  it('should call clear', () => {
    const {token} = portfolioTokenStorageMaker({
      tokenInfoStorage,
    })

    token.infos.clear()

    expect(tokenInfoStorage.clear).toHaveBeenCalled()
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
    onChange: jest.fn((_keysToObserve, callback) => {
      subscriptions.add(callback)

      return {
        unsubscribe: jest.fn(() => {
          subscriptions.delete(callback)
        }),
      } as any
    }),
  }
}
