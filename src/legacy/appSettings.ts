/* eslint-disable @typescript-eslint/no-explicit-any */

import ExtendableError from 'es6-error'
import _ from 'lodash'

import storage from '../legacy/storage'

// Note(ppershing): following values have to be in sync with
// keys in redux state
export const APP_SETTINGS_KEYS = {
  INSTALLATION_ID: 'installationId',
  CUSTOM_PIN_HASH: 'customPinHash',
  ACCEPTED_TOS: 'acceptedTos',
  LANG: 'languageCode',
  SYSTEM_AUTH_ENABLED: 'isSystemAuthEnabled',
  BIOMETRIC_HW_SUPPORT: 'isBiometricHardwareSupported',
  SEND_CRASH_REPORTS: 'sendCrashReports',
  CAN_ENABLE_BIOMETRIC_ENCRYPTION: 'canEnableBiometricEncryption',
  CURRENT_VERSION: 'currentVersion',
}

export type AppSettingsKey = typeof APP_SETTINGS_KEYS[keyof typeof APP_SETTINGS_KEYS]

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

export const removeAppSettings = async (setting: AppSettingsKey) => {
  await storage.remove(getAppSettingsStoragePath(setting))
}

export const readAppSettings = async (): Promise<AppSettings> => {
  const appSettingsKeys = Object.keys(APP_SETTINGS_KEYS).map((key) => getAppSettingsStoragePath(APP_SETTINGS_KEYS[key]))

  const appSettings = await storage.readMany(appSettingsKeys)
  return appSettings.reduce((acc, [key, value]) => {
    const setting = _.last(key.split('/'))

    return {
      ...acc,
      [setting as string]: value,
    }
  }, {}) as AppSettings
}

type AppSettings = {
  languageCode: string
}
