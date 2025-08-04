import {
  Hex,
  hex,
  mountAsyncStorage,
  mountMMKVStorage,
  observableStorageMaker,
  parseBoolean,
  parseNumber,
  parseSafe,
  parseString,
  storageKeyMaker,
} from '@yoroi/common'
import {parseCurrencySymbol} from '@yoroi/portfolio'
import {ThemeConfig, isThemeConfig} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'

import {MMKV} from 'react-native-mmkv'
import {of} from 'rxjs'
import * as uuid from 'uuid'

import {AuthSetting} from '~/features/Auth/common/types'
import {LegalAgreement} from '~/features/Legal/common/types'
import {defaultCurrency} from '~/kernel/constants'
import {
  LanguageCode,
  isLanguageCode,
  systemLanguageCode,
} from '~/kernel/i18n/localization'
import {debugStorage} from '~/kernel/storage/debug-storage'

export const rootMMKV = new MMKV({id: 'default.mmkv'})
export const rootSyncStorage = observableStorageMaker<false, string>(
  mountMMKVStorage({path: '/'}, {instance: rootMMKV}),
)
export const rootStorage = mountAsyncStorage({path: '/'})
export const keyStorage = rootStorage.join('keystore/')

// Root - Sync Storage
export const rootStorageObservable = observableStorageMaker(rootSyncStorage)
export const rootSyncStorageKeyMaker = storageKeyMaker(rootStorageObservable)

// Root - storageVersion
export const storageCurrentVersion = 3
export const keyStorageVersion = 'storageVersion'
export const storageVersionStorageKeyManager = rootSyncStorageKeyMaker({
  key: keyStorageVersion,
  parser: (data) => parseNumber(data) ?? storageCurrentVersion,
})

// Root - installationId
export const keyInstallationId = 'installationId'
export const installationIdStorageKeyManager = rootSyncStorageKeyMaker({
  key: keyInstallationId,
  parser: (data) => parseString(data),
})
export const initInstallationId = () => {
  const id = installationIdStorageKeyManager.read()
  if (id != null) return id

  const newInstallationId = uuid.v4()
  installationIdStorageKeyManager.save(newInstallationId)
  storageVersionStorageKeyManager.save(storageCurrentVersion)
  return newInstallationId
}

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

// Settings - Custom Pin - it is not a HASH
export const pinStorageKey = 'customPinHash'
export const pinStorageKeyManager = settingsStorageKeyMaker<
  Hex | undefined,
  string
>({
  key: pinStorageKey,
  parser: (data) => {
    const parsed = parseSafe(data)
    return typeof parsed === 'string' && parsed.length !== 0
      ? hex(parsed)
      : undefined
  },
})

// Settings - Crash reports
const crashReportsStorageKey = 'sendCrashReports'
export const crashReportsStorageKeyManager = settingsStorageKeyMaker<boolean>({
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

// Settings - Screen Share
export const screenShareStorageKey = 'screenShareEnabled'
export const screenShareStorageKeyManager = settingsStorageKeyMaker<boolean>({
  key: screenShareStorageKey,
  parser: (data) => Boolean(parseBoolean(data)),
})

// Settings - Metrics
export const metricsEnabledStorageKey = 'metrics-enabled'
export const metricsEnabledStorageKeyManager = settingsStorageKeyMaker<boolean>(
  {
    key: metricsEnabledStorageKey,
    parser: (data) => Boolean(parseBoolean(data)),
  },
)
export const metricsConsentRequestedStorageKey = 'metrics-consentRequested'
export const metricsConsentRequestedStorageKeyManager = settingsStorageKeyMaker(
  {
    key: metricsConsentRequestedStorageKey,
    parser: (data) => Boolean(parseBoolean(data)),
  },
)

// Settings - Currency
export const currencyStorageKey = 'currencySymbol'
export const currencyStorageKeyManager =
  settingsStorageKeyMaker<Portfolio.Currency.Symbol>({
    key: currencyStorageKey,
    parser: (data) => {
      const parsed = parseCurrencySymbol(data)
      return parsed ?? defaultCurrency
    },
  })

// Settings - Legal Agreement
export const isLegalAgreement = (data: unknown): data is LegalAgreement => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'latestAcceptedAgreementsDate' in data
  )
}
export const parseLegalAgreement = (data: unknown) => {
  const parsed = parseSafe(data)
  return isLegalAgreement(parsed) ? parsed : {latestAcceptedAgreementsDate: 0}
}
export const legalAgreementStorageKey = 'legalAgreement'
export const legalAgreementStorageKeyManager =
  settingsStorageKeyMaker<LegalAgreement>({
    key: legalAgreementStorageKey,
    parser: parseLegalAgreement,
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
