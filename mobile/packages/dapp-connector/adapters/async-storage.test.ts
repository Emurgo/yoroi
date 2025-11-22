import {Chain} from '@yoroi/types'

import AsyncStorage from '@react-native-async-storage/async-storage'

import {
  connectionStorageMaker,
  DappConnection,
  Storage,
} from './async-storage'

jest.mock('@react-native-async-storage/async-storage', () => {
  const storage: Record<string, string> = {}
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(storage[key] || null)),
      setItem: jest.fn((key: string, value: string) => {
        storage[key] = value
        return Promise.resolve()
      }),
      removeItem: jest.fn((key: string) => {
        delete storage[key]
        return Promise.resolve()
      }),
      clear: jest.fn(() => {
        Object.keys(storage).forEach((key) => delete storage[key])
        return Promise.resolve()
      }),
    },
  }
})

describe('connectionStorageMaker', () => {
  let storage: Storage

  beforeEach(() => {
    jest.clearAllMocks()
    storage = connectionStorageMaker()
  })

  afterEach(async () => {
    await AsyncStorage.clear()
  })

  describe('read', () => {
    it('should return empty array when storage is empty', async () => {
      const connections = await storage.read()
      expect(connections).toEqual([])
    })

    it('should return connections from storage', async () => {
      const connection: DappConnection = {
        walletId: 'wallet-1',
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      }
      await storage.save(connection)
      const connections = await storage.read()
      expect(connections).toHaveLength(1)
      expect(connections[0]).toEqual(connection)
    })

    it('should normalize connections with missing network to Mainnet', async () => {
      await AsyncStorage.setItem(
        'dapp-connections',
        JSON.stringify([
          {
            walletId: 'wallet-1',
            dappOrigin: 'https://example.com',
          },
        ]),
      )
      const connections = await storage.read()
      expect(connections).toHaveLength(1)
      expect(connections[0]).toEqual({
        walletId: 'wallet-1',
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      })
    })

    it('should throw error when walletId is missing', async () => {
      await AsyncStorage.setItem(
        'dapp-connections',
        JSON.stringify([
          {
            dappOrigin: 'https://example.com',
            network: Chain.Network.Mainnet,
          },
        ]),
      )
      await expect(storage.read()).rejects.toThrow('walletId is required')
    })

    it('should throw error when dappOrigin is missing', async () => {
      await AsyncStorage.setItem(
        'dapp-connections',
        JSON.stringify([
          {
            walletId: 'wallet-1',
            network: Chain.Network.Mainnet,
          },
        ]),
      )
      await expect(storage.read()).rejects.toThrow('dappOrigin is required')
    })
  })

  describe('save', () => {
    it('should save a new connection', async () => {
      const connection: DappConnection = {
        walletId: 'wallet-1',
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      }
      await storage.save(connection)
      const connections = await storage.read()
      expect(connections).toHaveLength(1)
      expect(connections[0]).toEqual(connection)
    })

    it('should throw error when saving duplicate connection', async () => {
      const connection: DappConnection = {
        walletId: 'wallet-1',
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      }
      await storage.save(connection)
      await expect(storage.save(connection)).rejects.toThrow(
        'Connection already exists',
      )
    })

    it('should allow saving connections with same walletId but different dappOrigin', async () => {
      const connection1: DappConnection = {
        walletId: 'wallet-1',
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      }
      const connection2: DappConnection = {
        walletId: 'wallet-1',
        dappOrigin: 'https://other.com',
        network: Chain.Network.Mainnet,
      }
      await storage.save(connection1)
      await storage.save(connection2)
      const connections = await storage.read()
      expect(connections).toHaveLength(2)
    })

    it('should allow saving connections with same dappOrigin but different walletId', async () => {
      const connection1: DappConnection = {
        walletId: 'wallet-1',
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      }
      const connection2: DappConnection = {
        walletId: 'wallet-2',
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      }
      await storage.save(connection1)
      await storage.save(connection2)
      const connections = await storage.read()
      expect(connections).toHaveLength(2)
    })

    it('should allow saving connections with same walletId and dappOrigin but different network', async () => {
      const connection1: DappConnection = {
        walletId: 'wallet-1',
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      }
      const connection2: DappConnection = {
        walletId: 'wallet-1',
        dappOrigin: 'https://example.com',
        network: Chain.Network.Testnet,
      }
      await storage.save(connection1)
      await storage.save(connection2)
      const connections = await storage.read()
      expect(connections).toHaveLength(2)
    })
  })

  describe('remove', () => {
    it('should remove a connection', async () => {
      const connection: DappConnection = {
        walletId: 'wallet-1',
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      }
      await storage.save(connection)
      await storage.remove(connection)
      const connections = await storage.read()
      expect(connections).toHaveLength(0)
    })

    it('should not remove non-matching connections', async () => {
      const connection1: DappConnection = {
        walletId: 'wallet-1',
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      }
      const connection2: DappConnection = {
        walletId: 'wallet-2',
        dappOrigin: 'https://other.com',
        network: Chain.Network.Mainnet,
      }
      await storage.save(connection1)
      await storage.save(connection2)
      await storage.remove(connection1)
      const connections = await storage.read()
      expect(connections).toHaveLength(1)
      expect(connections[0]).toEqual(connection2)
    })

    it('should not crash when removing non-existent connection', async () => {
      const connection: DappConnection = {
        walletId: 'wallet-1',
        dappOrigin: 'https://example.com',
        network: Chain.Network.Mainnet,
      }
      await storage.remove(connection)
      const connections = await storage.read()
      expect(connections).toHaveLength(0)
    })
  })

  describe('key', () => {
    it('should have correct key', () => {
      expect(storage.key).toBe('dapp-connections')
    })
  })
})

