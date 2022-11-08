import storage from '@react-native-async-storage/async-storage'

import {AUTH_SETTINGS_KEY, ENCRYPTED_PIN_HASH_KEY, INSTALLATION_ID_KEY, OLD_OS_AUTH_KEY} from '../Settings/types'
import {migrateAuthSetting} from './authOS'
describe('migrateAuthSetting', () => {
  const installationId = 'uuidv4'
  const os = JSON.stringify('os')
  const pin = JSON.stringify('pin')

  beforeEach(async () => {
    await storage.clear()
    await storage.setItem(INSTALLATION_ID_KEY, JSON.stringify(installationId))
  })

  it('method = null and no pin/os means new setup, it should remain null', async () => {
    await migrateAuthSetting(storage)

    await expect(await storage.getItem(AUTH_SETTINGS_KEY)).toBeNull()
  })

  // correct way should make sure that .setItem was not called
  // but there are some issues when resetting back the storage mock
  it('method != null remains the same', async () => {
    await storage.setItem(AUTH_SETTINGS_KEY, os)
    await migrateAuthSetting(storage)
    await expect(await storage.getItem(AUTH_SETTINGS_KEY)).toBe(os)

    await storage.setItem(AUTH_SETTINGS_KEY, pin)
    await migrateAuthSetting(storage)
    await expect(await storage.getItem(AUTH_SETTINGS_KEY)).toBe(pin)
  })

  // if the store is inconsistent we favor OS, so the user can disable on device and it will ask for a new pin
  it('old store is pin + os (inconsistent), method = "os"', async () => {
    await storage.multiSet([
      [ENCRYPTED_PIN_HASH_KEY, JSON.stringify('encrypted-hash')],
      [OLD_OS_AUTH_KEY, JSON.stringify(true)],
    ])

    await migrateAuthSetting(storage)

    await expect(await storage.getItem(AUTH_SETTINGS_KEY)).toBe(os)
  })

  it('old store is pin, method = "pin"', async () => {
    await storage.setItem(ENCRYPTED_PIN_HASH_KEY, JSON.stringify('encrypted-hash'))

    await migrateAuthSetting(storage)

    await expect(await storage.getItem(AUTH_SETTINGS_KEY)).toBe(pin)
  })
})
