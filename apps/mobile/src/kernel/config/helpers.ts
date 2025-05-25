import AsyncStorage, {
  AsyncStorageStatic,
} from '@react-native-async-storage/async-storage'
import {parseBoolean, parseSafe} from '@yoroi/common'
import {App} from '@yoroi/types'
import {mountMMKVStorage, observableStorageMaker} from '@yoroi/common'
import {themeStorageMaker} from '@yoroi/theme'

const crashReportsStorageKey = 'sendCrashReports'

export const getCrashReportsEnabled = async (
  storage: AsyncStorageStatic = AsyncStorage,
) => {
  const data = await storage.getItem(crashReportsStorageKey)
  return parseBoolean(data) ?? false
}

export type AuthSetting = 'pin' | 'os' | null
export const AUTH_WITH_OS: AuthSetting = 'os'
export const AUTH_WITH_PIN: AuthSetting = 'pin'

const isAuthSetting = (data: any): data is 'os' | 'pin' | undefined =>
  ['os', 'pin', undefined].includes(data)
const parseAuthSetting = (data: unknown) => {
  const parsed = parseSafe(data)
  return isAuthSetting(parsed) ? parsed : null
}

export const getAuthSetting = (storage: App.Storage) =>
  storage.join('appSettings/').getItem('auth', parseAuthSetting)

const themeDiscovery = mountMMKVStorage<string>({path: `theme/`})
const themeDiscoveryStorage = observableStorageMaker(themeDiscovery)
export const themeStorage = themeStorageMaker({
  storage: themeDiscoveryStorage,
})
