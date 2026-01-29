import {App} from '@yoroi/types'

import {recoverOrphanedWallets} from './recover-orphaned-wallets'

// Mock the logger
jest.mock('@yoroi/logger', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}))

// Mock walletChecksum from @emurgo/cip4-js
jest.mock('@emurgo/cip4-js', () => ({
  walletChecksum: jest.fn().mockImplementation((xpub: string) => ({
    TextPart: `PLATE-${xpub.substring(0, 4)}`,
    ImagePart: `seed-${xpub.substring(0, 8)}`,
  })),
}))

// Mock Blockies from @yoroi/identicon
jest.mock('@yoroi/identicon', () => ({
  Blockies: jest.fn().mockImplementation(() => ({
    asBase64: () => 'mock-avatar-base64',
  })),
}))

describe('recoverOrphanedWallets', () => {
  let mockStorage: App.Storage
  let storageData: Map<string, unknown>

  beforeEach(() => {
    storageData = new Map<string, unknown>()

    const createJoinedStorage = (prefix: string): App.Storage =>
      ({
        getItem: jest.fn().mockImplementation(async (key: string) => {
          const fullKey = prefix + key
          return storageData.get(fullKey) ?? null
        }),
        setItem: jest
          .fn()
          .mockImplementation(async (key: string, value: unknown) => {
            const fullKey = prefix + key
            storageData.set(fullKey, value)
          }),
        removeItem: jest.fn().mockImplementation(async (key: string) => {
          const fullKey = prefix + key
          storageData.delete(fullKey)
        }),
        getAllKeys: jest.fn().mockImplementation(async () => {
          const keys: string[] = []
          for (const key of storageData.keys()) {
            if (key.startsWith(prefix)) {
              keys.push(key.substring(prefix.length))
            }
          }
          return keys
        }),
        multiGet: jest.fn().mockImplementation(async (keys: string[]) => {
          return keys.map((key) => {
            const fullKey = prefix + key
            return [key, storageData.get(fullKey) ?? null]
          })
        }),
        join: jest.fn().mockImplementation((subPath: string) => {
          return createJoinedStorage(prefix + subPath)
        }),
        removeFolder: jest.fn().mockResolvedValue(undefined),
      }) as unknown as App.Storage

    mockStorage = createJoinedStorage('')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should recover regular wallet with xpriv', async () => {
    // Setup: keystore has keys, but wallet/ has no metadata
    storageData.set('keystore/wallet1-MASTER_PASSWORD', 'encrypted_xpriv')
    storageData.set('keystore/wallet1/0', 'xpub_hex_here')
    // No wallet/wallet1 entry

    const result = await recoverOrphanedWallets(mockStorage)

    expect(result.recoveredCount).toBe(1)
    expect(result.walletIds).toContain('wallet1')

    // Should create wallet metadata
    const meta = storageData.get('wallet/wallet1') as Record<string, unknown>
    expect(meta).toBeDefined()
    expect(meta.id).toBe('wallet1')
    expect(meta.name).toBe(meta.plate) // Name = plate
    expect(meta.isHW).toBe(false)
    expect(meta.isReadOnly).toBe(false)
    expect(meta.implementation).toBe('cardano-cip1852')
    expect(meta.addressMode).toBe('single')
  })

  it('should recover HW wallet (xpub only, no xpriv)', async () => {
    // Setup: only xpub exists (no -MASTER_PASSWORD)
    storageData.set('keystore/wallet2/0', 'xpub_hex_here')
    // No wallet/wallet2 entry

    const result = await recoverOrphanedWallets(mockStorage)

    expect(result.recoveredCount).toBe(1)
    expect(result.walletIds).toContain('wallet2')

    const meta = storageData.get('wallet/wallet2') as Record<string, unknown>
    expect(meta).toBeDefined()
    expect(meta.isHW).toBe(true)
    expect(meta.isReadOnly).toBe(false) // HW wallets are not read-only, they can sign via device
  })

  it('should not touch wallets that already have metadata', async () => {
    const existingMeta = {
      id: 'wallet3',
      name: 'Custom Name',
      version: 3,
      plate: 'EXISTING-PLATE',
      avatar: 'existing-avatar',
      implementation: 'cardano-cip1852',
      addressMode: 'single',
      isHW: false,
      isReadOnly: false,
      isEasyConfirmationEnabled: false,
      hwDeviceInfo: null,
    }
    storageData.set('keystore/wallet3-MASTER_PASSWORD', 'encrypted')
    storageData.set('keystore/wallet3/0', 'xpub')
    storageData.set('wallet/wallet3', existingMeta)

    const result = await recoverOrphanedWallets(mockStorage)

    expect(result.recoveredCount).toBe(0)
    expect(result.walletIds).toHaveLength(0)

    // Should not overwrite existing metadata
    const meta = storageData.get('wallet/wallet3') as Record<string, unknown>
    expect(meta.name).toBe('Custom Name')
  })

  it('should recover multiple orphaned wallets', async () => {
    // Regular wallet
    storageData.set('keystore/wallet1-MASTER_PASSWORD', 'encrypted1')
    storageData.set('keystore/wallet1/0', 'xpub1')
    // HW wallet
    storageData.set('keystore/wallet2/0', 'xpub2')
    // Another regular wallet
    storageData.set('keystore/wallet3-MASTER_PASSWORD', 'encrypted3')
    storageData.set('keystore/wallet3/0', 'xpub3')
    // No wallet/ entries for any of them

    const result = await recoverOrphanedWallets(mockStorage)

    expect(result.recoveredCount).toBe(3)
    expect(result.walletIds).toContain('wallet1')
    expect(result.walletIds).toContain('wallet2')
    expect(result.walletIds).toContain('wallet3')

    // Verify each wallet was recovered correctly
    const meta1 = storageData.get('wallet/wallet1') as Record<string, unknown>
    const meta2 = storageData.get('wallet/wallet2') as Record<string, unknown>
    const meta3 = storageData.get('wallet/wallet3') as Record<string, unknown>

    expect(meta1.isHW).toBe(false)
    expect(meta2.isHW).toBe(true)
    expect(meta3.isHW).toBe(false)
  })

  it('should skip wallets without xpub', async () => {
    // Wallet with only xpriv but no xpub (shouldn't happen normally)
    storageData.set('keystore/wallet1-MASTER_PASSWORD', 'encrypted')
    // No keystore/wallet1/0 entry

    const result = await recoverOrphanedWallets(mockStorage)

    expect(result.recoveredCount).toBe(0)
    expect(result.walletIds).toHaveLength(0)
  })

  it('should handle empty keystore gracefully', async () => {
    // No keystore data at all
    const result = await recoverOrphanedWallets(mockStorage)

    expect(result.recoveredCount).toBe(0)
    expect(result.walletIds).toHaveLength(0)
  })

  it('should handle storage errors gracefully', async () => {
    // Make getAllKeys throw an error
    const errorStorage = {
      ...mockStorage,
      join: jest.fn().mockImplementation(() => ({
        getAllKeys: jest.fn().mockRejectedValue(new Error('Storage error')),
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        multiGet: jest.fn(),
        join: jest.fn(),
        removeFolder: jest.fn(),
      })),
    } as unknown as App.Storage

    const result = await recoverOrphanedWallets(errorStorage)

    expect(result.recoveredCount).toBe(0)
    expect(result.walletIds).toHaveLength(0)
  })

  it('should continue recovering other wallets if one fails', async () => {
    // Setup two wallets, second one will fail because no xpub
    storageData.set('keystore/wallet1-MASTER_PASSWORD', 'encrypted1')
    storageData.set('keystore/wallet1/0', 'xpub1')
    storageData.set('keystore/wallet2-MASTER_PASSWORD', 'encrypted2')
    // wallet2 has no xpub - will be skipped

    const result = await recoverOrphanedWallets(mockStorage)

    expect(result.recoveredCount).toBe(1)
    expect(result.walletIds).toContain('wallet1')
  })

  it('should set hwDeviceInfo to null for recovered HW wallets', async () => {
    storageData.set('keystore/wallet1/0', 'xpub_for_hw_wallet')
    // No xpriv means it's a HW wallet

    await recoverOrphanedWallets(mockStorage)

    const meta = storageData.get('wallet/wallet1') as Record<string, unknown>
    expect(meta.hwDeviceInfo).toBeNull()
  })

  it('should set isEasyConfirmationEnabled to false for recovered wallets', async () => {
    storageData.set('keystore/wallet1-MASTER_PASSWORD', 'encrypted')
    storageData.set('keystore/wallet1/0', 'xpub')

    await recoverOrphanedWallets(mockStorage)

    const meta = storageData.get('wallet/wallet1') as Record<string, unknown>
    expect(meta.isEasyConfirmationEnabled).toBe(false)
  })
})
