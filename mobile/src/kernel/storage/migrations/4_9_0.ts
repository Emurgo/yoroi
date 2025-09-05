import {parseBoolean} from '@yoroi/common'
import {App} from '@yoroi/types'

import {authWithOs, authWithPin} from '~/features/Auth/common/constants'
import {parseAuthSetting} from '~/kernel/storage/storages'

export const getAuthSetting = async (storage: App.Storage) => {
  const authSetting = await storage
    .join('appSettings/')
    .getItem('auth', parseAuthSetting)
  return authSetting ?? null
}

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

  if (isAuthWithOS)
    return storage.join('appSettings/').setItem('auth', authWithOs)

  const isAuthWithPIN = await storage
    .join('appSettings/')
    .getItem('customPinHash')
    .then(Boolean)
  if (isAuthWithPIN)
    return storage.join('appSettings/').setItem('auth', authWithPin)
}

export const to4_9_0 = migrateAuthSetting

export const OLD_OS_AUTH_KEY = 'isSystemAuthEnabled'
