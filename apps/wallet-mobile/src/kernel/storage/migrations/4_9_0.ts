import {parseBoolean} from '@yoroi/common'
import {App} from '@yoroi/types'

import {
  AUTH_WITH_OS,
  AUTH_WITH_PIN,
  disableAllEasyConfirmation,
  getAuthSetting,
} from '../../../features/Auth/common/hooks'

export const migrateAuthSetting = async (storage: App.Storage) => {
  const authSetting = await getAuthSetting(storage)
  const isFirstRun = await storage
    .join('appSettings/')
    .getItem('installationId')
    .then((value) => value === null)
  const isLegacyAuth = authSetting == null && !isFirstRun
  if (!isLegacyAuth) return

  const isAuthWithOS = await storage
    .join('appSettings/')
    .getItem(OLD_OS_AUTH_KEY)
    .then((value) => parseBoolean(value) ?? false)
  if (isAuthWithOS) {
    await storage.join('appSettings/').setItem('auth', AUTH_WITH_OS)
    return disableAllEasyConfirmation(storage)
  }

  const isAuthWithPIN = await storage.join('appSettings/').getItem('customPinHash').then(Boolean)
  if (isAuthWithPIN) {
    return storage.join('appSettings/').setItem('auth', AUTH_WITH_PIN)
  }
}

export const to4_9_0 = migrateAuthSetting

export const OLD_OS_AUTH_KEY = 'isSystemAuthEnabled'
