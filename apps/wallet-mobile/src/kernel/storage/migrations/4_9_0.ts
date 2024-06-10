import {App} from '@yoroi/types'

import {AUTH_WITH_PIN, getAuthSetting} from '../../../features/Auth/common/hooks'

export const migrateAuthSetting = async (storage: App.Storage) => {
  const authSetting = await getAuthSetting(storage)
  const isFirstRun = await storage
    .join('appSettings/')
    .getItem('installationId')
    .then((value) => value === null)
  const isLegacyAuth = authSetting == null && !isFirstRun
  if (!isLegacyAuth) return

  const isAuthWithPIN = await storage.join('appSettings/').getItem('customPinHash').then(Boolean)
  if (isAuthWithPIN) {
    return storage.join('appSettings/').setItem('auth', AUTH_WITH_PIN)
  }
}

export const to4_9_0 = migrateAuthSetting

export const OLD_OS_AUTH_KEY = 'isSystemAuthEnabled'
