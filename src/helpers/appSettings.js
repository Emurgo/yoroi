// @flow
import ExtendableError from 'es6-error'
import _ from 'lodash'

import storage from '../utils/storage'

export const APP_SETTINGS_KEYS = {
  APP_ID: 'appId',
  CUSTOM_PIN_HASH: 'customPinHash',
  ACCEPTED_TOS: 'acceptedTos',
  LANG: 'languageCode',
  SYSTEM_AUTH_ENABLED: 'isSystemAuthEnabled',
  FINGERPRINT_HW_SUPPORT: 'isFingerprintsHardwareSupported',
  HAS_FINGERPRINTS_ENROLLED: 'hasEnrolledFingerprints',
}

export type AppSettingsKey = $Values<typeof APP_SETTINGS_KEYS>

// thrown when app settings is missing
export class AppSettingsError extends ExtendableError {
  constructor(key: AppSettingsKey) {
    super(`Application setting ${key} is missing.`)
  }
}

const getAppSettingsStoragePath = (key: AppSettingsKey) => `/appSettings/${key}`

export const writeAppSettings = (setting: AppSettingsKey, value: any) => {
  const appSettingsKey = getAppSettingsStoragePath(setting)
  return storage.write(appSettingsKey, value)
}

export const readAppSettings = async () => {
  const appSettingsKeys = Object.keys(APP_SETTINGS_KEYS).map((key) =>
    getAppSettingsStoragePath(APP_SETTINGS_KEYS[key]),
  )

  const appSettings = await storage.readMany(appSettingsKeys)
  return appSettings.reduce((acc, [key, value]) => {
    const setting = _.last(key.split('/'))
    return {...acc, [setting]: value}
  }, {})
}
