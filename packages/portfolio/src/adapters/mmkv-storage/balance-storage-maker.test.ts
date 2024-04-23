import {storageSerializer} from '@yoroi/common'
import {App, Portfolio} from '@yoroi/types'

import {portfolioBalanceStorageMaker} from './balance-storage-maker'
import {tokenMocks} from '../token.mocks'
import {deserializers} from '../../transformers/deserializers'
import {tokenBalanceMocks} from '../token-balance.mocks'

describe('portfolioBalanceStorageMaker', () => {
  let balanceStorage: App.ObservableStorage<false, Portfolio.Token.Id>
  let primaryBreakdownStorage: App.ObservableStorage<false, Portfolio.Token.Id>

  beforeEach(() => {
    balanceStorage = createMockStorage(
      'v2/wallets/id/balance/',
      deserializers.tokenBalance,
    )
    primaryBreakdownStorage = createMockStorage(
      'v2/wallets/id/primary-breakdown/',
      deserializers.primaryBreakdown,
    )

    balanceStorage.clear()
    primaryBreakdownStorage.clear()

    jest.clearAllMocks()
  })

  it('should instantiate storage', () => {
    const storage = portfolioBalanceStorageMaker({
      balanceStorage,
      primaryBreakdownStorage,
      primaryTokenId: tokenMocks.primaryETH.info.id,
    })

    expect(storage).toBeDefined()
    expect(Object.isFrozen(storage)).toBe(true)
  })

  it('should save balances entries', () => {
    const {balances} = portfolioBalanceStorageMaker({
      balanceStorage,
      primaryBreakdownStorage,
      primaryTokenId: tokenMocks.primaryETH.info.id,
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

    const {balances} = portfolioBalanceStorageMaker({
      balanceStorage,
      primaryBreakdownStorage,
      primaryTokenId: tokenMocks.primaryETH.info.id,
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

  it('should clear all portfolio records', () => {
    const {clear, balances, primaryBreakdown} = portfolioBalanceStorageMaker({
      balanceStorage,
      primaryBreakdownStorage,
      primaryTokenId: tokenMocks.primaryETH.info.id,
    })

    balances.save(tokenBalanceMocks.storage.entries1)
    primaryBreakdown.save(tokenBalanceMocks.primaryETHBreakdown)

    let balanceResult = balances.all()
    let primaryBreakdownResult = primaryBreakdown.read()

    expect(balanceResult).toEqual(tokenBalanceMocks.storage.entries1)
    expect(primaryBreakdownResult).toEqual(
      tokenBalanceMocks.primaryETHBreakdown,
    )

    clear()

    balanceResult = balances.all()
    primaryBreakdownResult = primaryBreakdown.read()

    // keys are gone
    expect(balanceResult).toEqual([])
    expect(primaryBreakdownResult).toEqual(null)

    expect(balanceStorage.clear).toHaveBeenCalled()
    expect(primaryBreakdownStorage.clear).toHaveBeenCalled()
  })

  it('should return all keys', () => {
    const {balances, primaryBreakdown} = portfolioBalanceStorageMaker({
      balanceStorage,
      primaryBreakdownStorage,
      primaryTokenId: tokenMocks.primaryETH.info.id,
    })

    balances.save(tokenBalanceMocks.storage.entries1)
    primaryBreakdown.save(tokenBalanceMocks.primaryETHBreakdown)

    let balanceResult = balances.keys()

    expect(balanceResult).toEqual([
      ...new Map(tokenBalanceMocks.storage.entries1).keys(),
    ])
  })

  it('should call clear', () => {
    const {balances, primaryBreakdown} = portfolioBalanceStorageMaker({
      balanceStorage,
      primaryBreakdownStorage,
      primaryTokenId: tokenMocks.primaryETH.info.id,
    })

    balances.clear()
    primaryBreakdown.clear()

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
