import storage from '@react-native-async-storage/async-storage'

import {AUTH_WITH_OS, AUTH_WITH_PIN, disableAllEasyConfirmation, getAuthSetting} from '../../auth'
import {SettingsStorageKeys, Storage} from '../StorageProvider'

export const migrateAuthSetting = async (storage: Storage) => {
  const authSetting = await getAuthSetting(storage)
  const isFirstRun = await storage.getItem(SettingsStorageKeys.InstallationId).then((data) => data === null)
  const isLegacyAuth = authSetting == null && !isFirstRun
  if (!isLegacyAuth) return

  const isAuthWithOS = await storage.getItem(SettingsStorageKeys.OldAuthWithOs).then(Boolean)
  if (isAuthWithOS) {
    await storage.setItem(SettingsStorageKeys.Auth, JSON.stringify(AUTH_WITH_OS))
    return disableAllEasyConfirmation()
  }

  const isAuthWithPIN = await storage.getItem(SettingsStorageKeys.Pin).then(Boolean)
  if (isAuthWithPIN) {
    return storage.setItem(SettingsStorageKeys.Auth, JSON.stringify(AUTH_WITH_PIN))
  }
}

export const to4_9_0 = async () => migrateAuthSetting(storage)
