import storage from '@react-native-async-storage/async-storage'

import {SettingsStorageKeys} from '../StorageProvider'
import {migrateAuthSetting} from './authSetting'
describe('migrateAuthSetting', () => {
  const installationId = 'uuidv4'
  const os = JSON.stringify('os')
  const pin = JSON.stringify('pin')

  beforeEach(async () => {
    await storage.clear()
    await storage.setItem(SettingsStorageKeys.InstallationId, JSON.stringify(installationId))
  })

  it('method = null and no pin/os means new setup, it should remain null', async () => {
    await migrateAuthSetting(storage)

    await expect(await storage.getItem(SettingsStorageKeys.Auth)).toBeNull()
  })

  // correct way should make sure that .setItem was not called
  // but there are some issues when resetting back the storage mock
  it('method != null remains the same', async () => {
    await storage.setItem(SettingsStorageKeys.Auth, os)
    await migrateAuthSetting(storage)
    await expect(await storage.getItem(SettingsStorageKeys.Auth)).toBe(os)

    await storage.setItem(SettingsStorageKeys.Auth, pin)
    await migrateAuthSetting(storage)
    await expect(await storage.getItem(SettingsStorageKeys.Auth)).toBe(pin)
  })

  // if the store is inconsistent we favor OS, so the user can disable on device and it will ask for a new pin
  it('old store is pin + os (inconsistent), method = "os"', async () => {
    await storage.multiSet([
      [SettingsStorageKeys.Pin, JSON.stringify('encrypted-hash')],
      [SettingsStorageKeys.OldAuthWithOs, JSON.stringify(true)],
    ])

    await migrateAuthSetting(storage)

    await expect(await storage.getItem(SettingsStorageKeys.Auth)).toBe(os)
  })

  it('old store is pin, method = "pin"', async () => {
    await storage.setItem(SettingsStorageKeys.Pin, JSON.stringify('encrypted-hash'))

    await migrateAuthSetting(storage)

    await expect(await storage.getItem(SettingsStorageKeys.Auth)).toBe(pin)
  })
})
