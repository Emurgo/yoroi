import {MMKV} from 'react-native-mmkv'
import {of} from 'rxjs'

import {
  mountAsyncStorage,
  mountMMKVStorage,
  observableStorageMaker,
  parseBoolean,
  parseSafe,
  storageKeyMaker,
} from '@yoroi/common'
import {ThemeConfig, isThemeConfig} from '@yoroi/theme'

import {AuthSetting} from '../../features/Auth/common/types'
import {
  LanguageCode,
  isLanguageCode,
  systemLanguageCode,
} from '../i18n/localization'
import {debugStorage} from './debug-storage'

const rootMMKV = new MMKV({id: 'default.mmkv'})
export const rootSyncStorage = observableStorageMaker<false, string>(
  mountMMKVStorage({path: '/'}, {instance: rootMMKV}),
)
export const rootStorage = mountAsyncStorage({path: '/'})
export const keyStorage = rootStorage.join('keystore/')

// Settings
export const appSettingsStorage = rootSyncStorage.join('appSettings/')
export const appSettingsObservableStorage =
  observableStorageMaker(appSettingsStorage)
const settingsStorageKeyMaker = storageKeyMaker(appSettingsObservableStorage)

// Settings - Theme
export const themeStorageKey = 'theme'
export const themeStorageKeyManager = settingsStorageKeyMaker<ThemeConfig>({
  key: themeStorageKey,
  parser: (data) => {
    const parsed = parseSafe(data)
    return isThemeConfig(parsed) ? parsed : 'system'
  },
})

// Settings - Auth
export const authStorageKey = 'auth'
export const isAuthSetting = (data: any): data is 'os' | 'pin' | undefined =>
  ['os', 'pin', undefined].includes(data)
export const parseAuthSetting = (data: unknown) => {
  const parsed = parseSafe(data)
  return isAuthSetting(parsed) ? parsed : null
}
export const authStorageKeyManager = settingsStorageKeyMaker<
  AuthSetting | undefined | null
>({
  key: authStorageKey,
  parser: parseAuthSetting,
})

// Settings - Custom Pin Hash
export const pinHashStorageKey = 'customPinHash'
export const pinHashStorageKeyManager = settingsStorageKeyMaker<
  string | undefined
>({
  key: pinHashStorageKey,
  parser: (data) => {
    const parsed = parseSafe(data)
    return typeof parsed === 'string' && parsed.length !== 0
      ? parsed
      : undefined
  },
})

// Settings - Crash reports
const crashReportsStorageKey = 'sendCrashReports'
export const crashReportsStorageKeyManager = settingsStorageKeyMaker<Boolean>({
  key: crashReportsStorageKey,
  parser: (data) => Boolean(parseBoolean(data)),
})

// Settings - Language
export const languageStorageKey = 'languageCode'
export const languageStorageKeyManager = settingsStorageKeyMaker<LanguageCode>({
  key: languageStorageKey,
  parser: (data) => {
    const parsed = parseSafe(data)
    return isLanguageCode(parsed) ? parsed : systemLanguageCode
  },
})

// Debug storage
const observableFunction = (v: unknown) => {
  console.log(`key with value udpated -> `, v)
  return of(null)
}
appSettingsObservableStorage.observable.subscribe((v) => {
  observableFunction(v)
  debugStorage(rootMMKV)
})
