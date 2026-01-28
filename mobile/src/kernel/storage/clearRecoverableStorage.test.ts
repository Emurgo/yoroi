import {clearRecoverableStorage, rootMMKV, rootStorage} from './storages'

// Mock the logger
jest.mock('~/kernel/logger/logger', () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

// Mock uuid for installationId
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-installation-id'),
}))

describe('clearRecoverableStorage', () => {
  let storageData: Map<string, string>
  let mmkvData: Map<string, string>

  beforeEach(() => {
    storageData = new Map<string, string>()
    mmkvData = new Map<string, string>()

    // Mock rootStorage
    jest.spyOn(rootStorage, 'getAllKeys').mockImplementation(async () => {
      return Array.from(storageData.keys())
    })
    jest.spyOn(rootStorage, 'removeItem').mockImplementation(async (key) => {
      storageData.delete(key)
    })
    jest
      .spyOn(rootStorage, 'setItem')
      .mockImplementation(async (key, value) => {
        storageData.set(key, JSON.stringify(value))
      })
    jest.spyOn(rootStorage, 'getItem').mockImplementation(async (key) => {
      const value = storageData.get(key)
      return value ? JSON.parse(value) : null
    })

    // Mock rootMMKV
    jest.spyOn(rootMMKV, 'clearAll').mockImplementation(() => {
      mmkvData.clear()
    })
    jest.spyOn(rootMMKV, 'set').mockImplementation((key, value) => {
      mmkvData.set(key, String(value))
    })
    jest.spyOn(rootMMKV, 'getString').mockImplementation((key) => {
      return mmkvData.get(key)
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should preserve keystore keys while clearing other data', async () => {
    // Setup: storage with keystore and other data
    storageData.set('keystore/wallet1-MASTER_PASSWORD', '"encrypted_xpriv"')
    storageData.set('keystore/wallet1/0', '"xpub_hex"')
    storageData.set('wallet/wallet1', '{"name":"My Wallet"}')
    storageData.set('appSettings/theme', '"dark"')
    storageData.set('storageVersion', '3')

    await clearRecoverableStorage()

    // Keystore should be preserved
    expect(storageData.has('keystore/wallet1-MASTER_PASSWORD')).toBe(true)
    expect(storageData.has('keystore/wallet1/0')).toBe(true)
    // Other data should be cleared
    expect(storageData.has('wallet/wallet1')).toBe(false)
    expect(storageData.has('appSettings/theme')).toBe(false)
    // storageVersion is cleared but re-initialized by initInstallationId
  })

  it('should preserve multiple wallet keystores', async () => {
    // Setup: multiple wallets with keys
    storageData.set('keystore/wallet1-MASTER_PASSWORD', '"encrypted1"')
    storageData.set('keystore/wallet1/0', '"xpub1"')
    storageData.set('keystore/wallet2-MASTER_PASSWORD', '"encrypted2"')
    storageData.set('keystore/wallet2/0', '"xpub2"')
    storageData.set('keystore/wallet3/0', '"xpub3"') // HW wallet (no xpriv)
    storageData.set('wallet/wallet1', '{"name":"Wallet 1"}')
    storageData.set('wallet/wallet2', '{"name":"Wallet 2"}')
    storageData.set('wallet/wallet3', '{"name":"Wallet 3"}')

    await clearRecoverableStorage()

    // All keystores should be preserved
    expect(storageData.has('keystore/wallet1-MASTER_PASSWORD')).toBe(true)
    expect(storageData.has('keystore/wallet1/0')).toBe(true)
    expect(storageData.has('keystore/wallet2-MASTER_PASSWORD')).toBe(true)
    expect(storageData.has('keystore/wallet2/0')).toBe(true)
    expect(storageData.has('keystore/wallet3/0')).toBe(true)
    // Wallet metadata should be cleared
    expect(storageData.has('wallet/wallet1')).toBe(false)
    expect(storageData.has('wallet/wallet2')).toBe(false)
    expect(storageData.has('wallet/wallet3')).toBe(false)
  })

  it('should clear MMKV storage', async () => {
    mmkvData.set('someKey', 'someValue')
    mmkvData.set('anotherKey', 'anotherValue')

    await clearRecoverableStorage()

    expect(rootMMKV.clearAll).toHaveBeenCalled()
  })

  it('should handle empty storage gracefully', async () => {
    // Storage is empty
    await expect(clearRecoverableStorage()).resolves.not.toThrow()
  })

  it('should handle storage with only keystore data', async () => {
    storageData.set('keystore/wallet1-MASTER_PASSWORD', '"encrypted"')
    storageData.set('keystore/wallet1/0', '"xpub"')

    await clearRecoverableStorage()

    // Keystore should still be present
    expect(storageData.has('keystore/wallet1-MASTER_PASSWORD')).toBe(true)
    expect(storageData.has('keystore/wallet1/0')).toBe(true)
  })

  it('should clear legacy storage paths', async () => {
    storageData.set('keystore/wallet1/0', '"xpub"')
    storageData.set('legacy/mainnet/v1/wallet1/utxos', '[]')
    storageData.set('legacy/mainnet/v1/wallet1/transactions', '[]')
    storageData.set('legacy/preprod/v1/wallet1/utxos', '[]')

    await clearRecoverableStorage()

    // Keystore preserved
    expect(storageData.has('keystore/wallet1/0')).toBe(true)
    // Legacy data cleared
    expect(storageData.has('legacy/mainnet/v1/wallet1/utxos')).toBe(false)
    expect(storageData.has('legacy/mainnet/v1/wallet1/transactions')).toBe(
      false,
    )
    expect(storageData.has('legacy/preprod/v1/wallet1/utxos')).toBe(false)
  })
})
