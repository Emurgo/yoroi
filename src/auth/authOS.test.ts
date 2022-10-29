import storage from '@react-native-async-storage/async-storage'

import {migrateAuthMethod} from './authOS'
import {KeychainStorage} from './KeychainStorage'

const mockKeychainStorage: typeof KeychainStorage = {
  read: jest.fn(),
  write: jest.fn(),
  remove: jest.fn(),
  initializeAppAuth: jest.fn(),
  appAuth: jest.fn(),
}

describe('migrateAuthMethod', () => {
  const installationId = 'uuidv4'
  const os = JSON.stringify('os')
  const pin = JSON.stringify('pin')

  beforeEach(async () => {
    await storage.clear()
  })

  it('method = null and no pin/os means new setup, it should remain null', async () => {
    const keychainStorage = {
      ...mockKeychainStorage,
      write: jest.fn(),
    }
    await storage.setItem(INSTALLATION_ID_KEY, JSON.stringify(installationId))

    await migrateAuthMethod(storage, keychainStorage)

    await expect(await storage.getItem(AUTH_METHOD_KEY)).toBeNull()
  })

  // correct way should make sure that .setItem was not called
  // but there are some issues when resetting back the storage mock
  it('method != null remains the same', async () => {
    const keychainStorage = {
      ...mockKeychainStorage,
      write: jest.fn(),
    }
    await storage.setItem(INSTALLATION_ID_KEY, JSON.stringify(installationId))

    await storage.setItem(AUTH_METHOD_KEY, os)
    await migrateAuthMethod(storage, keychainStorage)
    await expect(await storage.getItem(AUTH_METHOD_KEY)).toBe(os)

    await storage.setItem(AUTH_METHOD_KEY, pin)
    await migrateAuthMethod(storage, keychainStorage)
    await expect(await storage.getItem(AUTH_METHOD_KEY)).toBe(pin)
  })

  // if the store is inconsistent we favor OS, so the user can disable on device and it will ask for a new pin
  it('old store is pin + os (inconsistent), method = "os"', async () => {
    await storage.setItem(INSTALLATION_ID_KEY, JSON.stringify(installationId))
    await storage.multiSet([
      [ENCRYPTED_PIN_HASH_KEY, JSON.stringify('encrypted-hash')],
      [OLD_OS_AUTH_KEY, JSON.stringify(true)],
    ])
    const keychainStorage = {
      ...mockKeychainStorage,
      write: jest.fn(),
    }

    await migrateAuthMethod(storage, keychainStorage)

    await expect(await storage.getItem(AUTH_METHOD_KEY)).toBe(os)
  })

  it('old store is pin, method = "pin"', async () => {
    await storage.setItem(INSTALLATION_ID_KEY, JSON.stringify(installationId))
    await storage.setItem(ENCRYPTED_PIN_HASH_KEY, JSON.stringify('encrypted-hash'))
    const keychainStorage = {
      ...mockKeychainStorage,
      write: jest.fn(),
    }

    await migrateAuthMethod(storage, keychainStorage)

    await expect(await storage.getItem(AUTH_METHOD_KEY)).toBe(pin)
  })
})

const OLD_OS_AUTH_KEY = '/appSettings/isSystemAuthEnabled'
const ENCRYPTED_PIN_HASH_KEY = '/appSettings/customPinHash'
const AUTH_METHOD_KEY = '/appSettings/authMethod'
const INSTALLATION_ID_KEY = '/appSettings/installationId'
