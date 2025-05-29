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
import {ThemeName, isThemeName} from '@yoroi/theme'

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
export const themeStorageKeyManager = settingsStorageKeyMaker<ThemeName>({
  key: 'theme',
  parser: (data) => {
    const parsed = parseSafe(data)
    return isThemeName(parsed) ? parsed : 'system'
  },
})

// Settings - Auth
export type AuthSetting = 'pin' | 'os' | null
export const authWithOs: AuthSetting = 'os'
export const authWithPin: AuthSetting = 'pin'
export const authStorageKey = 'auth'
export const isAuthSetting = (data: any): data is 'os' | 'pin' | undefined =>
  ['os', 'pin', undefined].includes(data)
export const parseAuthSetting = (data: unknown) => {
  const parsed = parseSafe(data)
  return isAuthSetting(parsed) ? parsed : null
}
export const authStorageKeyManager = settingsStorageKeyMaker<
  AuthSetting | undefined
>({
  key: authStorageKey,
  parser: parseAuthSetting,
})

// Settings - Crash reports
const crashReportsStorageKey = 'sendCrashReports'
export const crashReportsStorageKeyManager = settingsStorageKeyMaker<Boolean>({
  key: crashReportsStorageKey,
  parser: (data) => Boolean(parseBoolean(data)),
})

// Debug storage
if (__DEV__) debugStorage(rootMMKV)
if (__DEV__) debugStorage(rootStorage)

const observableFunction = (v: unknown) => {
  console.log(`key with value udpated -> `, v)
  return of(null)
}

rootSyncStorage.observable.subscribe((v) => {
  observableFunction(v)
  debugStorage(rootMMKV)
})
appSettingsObservableStorage.observable.subscribe((v) => {
  observableFunction(v)
  debugStorage(rootMMKV)
})
