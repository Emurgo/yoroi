import {BaseStorage} from '@yoroi/types'

import {getPersistentDappId, getPersistentWalletId} from './id-utils'

describe('id-utils', () => {
  const createMockStorage = (): BaseStorage => {
    const storage: Record<string, string> = {}

    return {
      getItem: async (key: string): Promise<string | null> => {
        return storage[key] ?? null
      },
      setItem: async (key: string, value: string): Promise<void> => {
        storage[key] = value
      },
      removeItem: async (key: string): Promise<void> => {
        delete storage[key]
      },
    }
  }

  describe('getPersistentDappId', () => {
    it('should generate a new ID if none exists', async () => {
      const storage = createMockStorage()
      const id = await getPersistentDappId(storage)

      expect(id).toMatch(/^dapp-/)
      expect(id.length).toBeGreaterThan(5)
    })

    it('should return existing ID if stored', async () => {
      const storage = createMockStorage()
      const existingId = 'dapp-existing-id-123'
      await storage.setItem('dapp-peer-id', existingId)

      const id = await getPersistentDappId(storage)

      expect(id).toBe(existingId)
    })

    it('should persist generated ID', async () => {
      const storage = createMockStorage()
      const id1 = await getPersistentDappId(storage)
      const id2 = await getPersistentDappId(storage)

      expect(id1).toBe(id2)
    })
  })

  describe('getPersistentWalletId', () => {
    it('should generate a new ID if none exists', async () => {
      const storage = createMockStorage()
      const id = await getPersistentWalletId(storage)

      expect(id).toMatch(/^wallet-/)
      expect(id.length).toBeGreaterThan(5)
    })

    it('should return existing ID if stored', async () => {
      const storage = createMockStorage()
      const existingId = 'wallet-existing-id-123'
      await storage.setItem('wallet-peer-id', existingId)

      const id = await getPersistentWalletId(storage)

      expect(id).toBe(existingId)
    })

    it('should persist generated ID', async () => {
      const storage = createMockStorage()
      const id1 = await getPersistentWalletId(storage)
      const id2 = await getPersistentWalletId(storage)

      expect(id1).toBe(id2)
    })
  })
})
