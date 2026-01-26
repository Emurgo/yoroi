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
import {logger} from '~/kernel/logger/logger'
import {debugStorage} from '~/kernel/storage/debug-storage'

/**
 * Storage integrity check result
 */
export type StorageIntegrityResult = {
  isHealthy: boolean
  mmkvHealthy: boolean
  asyncStorageHealthy: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates storage integrity before migrations
 * Attempts basic read/write operations to detect corruption
 */
export const validateStorageIntegrity =
  async (): Promise<StorageIntegrityResult> => {
    const result: StorageIntegrityResult = {
      isHealthy: true,
      mmkvHealthy: true,
      asyncStorageHealthy: true,
      errors: [],
      warnings: [],
    }

    // Test MMKV integrity
    try {
      const testKey = '__integrity_check__'
      const testValue = `test_${Date.now()}`

      // Write test
      rootMMKV.set(testKey, testValue)

      // Read test
      const readValue = rootMMKV.getString(testKey)
      if (readValue !== testValue) {
        result.mmkvHealthy = false
        result.errors.push('MMKV read/write mismatch')
      }

      // Delete test
      rootMMKV.delete(testKey)

      // Verify all keys can be listed
      const allKeys = rootMMKV.getAllKeys()
      if (!Array.isArray(allKeys)) {
        result.mmkvHealthy = false
        result.errors.push('MMKV getAllKeys returned invalid result')
      }
    } catch (error) {
      result.mmkvHealthy = false
      result.errors.push(
        `MMKV integrity check failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    // Test AsyncStorage integrity
    try {
      const testKey = '__integrity_check__'
      const testValue = `test_${Date.now()}`

      // Write test
      await rootStorage.setItem(testKey, testValue)

      // Read test
      const readValue = await rootStorage.getItem(testKey)
      if (readValue !== testValue) {
        result.asyncStorageHealthy = false
        result.errors.push('AsyncStorage read/write mismatch')
      }

      // Delete test
      await rootStorage.removeItem(testKey)

      // Verify getAllKeys works
      const allKeys = await rootStorage.getAllKeys()
      if (!Array.isArray(allKeys)) {
        result.asyncStorageHealthy = false
        result.errors.push('AsyncStorage getAllKeys returned invalid result')
      }
    } catch (error) {
      result.asyncStorageHealthy = false
      result.errors.push(
        `AsyncStorage integrity check failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    // Overall health status
    result.isHealthy = result.mmkvHealthy && result.asyncStorageHealthy

    // Log results
    if (!result.isHealthy) {
      logger.error('Storage integrity check failed', {
        result,
      })
    } else {
      logger.debug('Storage integrity check passed')
    }

    return result
  }

/**
 * Attempt to recover from storage corruption
 * Returns true if recovery was successful
 */
export const attemptStorageRecovery = async (): Promise<boolean> => {
  logger.warn('Attempting storage recovery...')

  try {
    // For MMKV, we can try to trim
    rootMMKV.trim()

    // Re-validate after recovery attempt
    const result = await validateStorageIntegrity()
    if (result.isHealthy) {
      logger.info('Storage recovery successful')
      return true
    }

    logger.error(
      'Storage recovery failed - manual intervention may be required',
    )
    return false
  } catch (error) {
    logger.error('Storage recovery threw error', {error})
    return false
  }
}

/**
 * Clear all storage data - used for unrecoverable corruption
 * WARNING: This will delete all wallets and settings!
 * Users will need to restore from recovery phrase
 * This function never throws - all errors are caught and logged
 */
export const clearAllStorage = async (): Promise<void> => {
  logger.warn('Clearing all storage due to unrecoverable corruption')

  try {
    // Clear MMKV
    rootMMKV.clearAll()
    logger.info('MMKV storage cleared')
  } catch (error) {
    logger.error('Failed to clear MMKV storage', {error})
  }

  try {
    // Clear AsyncStorage
    const allKeys = await rootStorage.getAllKeys()
    for (const key of allKeys) {
      await rootStorage.removeItem(key)
    }
    logger.info('AsyncStorage cleared')
  } catch (error) {
    logger.error('Failed to clear AsyncStorage', {error})
  }

  // Re-initialize as fresh install - wrapped in try-catch since MMKV might still be corrupted
  try {
    initInstallationId()
    logger.info('Storage cleared and re-initialized as fresh install')
  } catch (error) {
    logger.error('Failed to initialize fresh install after clearing storage', {
      error,
    })
    // App will behave as fresh install anyway since storage is cleared
  }
}

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
export const storageCurrentVersion = 4
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
export const isAuthSetting = (
  data: unknown,
): data is 'os' | 'pin' | undefined => {
  return data === 'os' || data === 'pin' || data === undefined
}
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

// Settings - Metrics
export const metricsEnabledStorageKey = 'metricsEnabled'
export const metricsEnabledStorageKeyManager = settingsStorageKeyMaker<boolean>(
  {
    key: metricsEnabledStorageKey,
    parser: (data) => Boolean(parseBoolean(data)),
  },
)
export const metricsConsentRequestedStorageKey = 'metricsConsentRequested'
export const metricsConsentRequestedStorageKeyManager = settingsStorageKeyMaker(
  {
    key: metricsConsentRequestedStorageKey,
    parser: (data) => Boolean(parseBoolean(data)),
  },
)

// Settings - Privacy Mode
export const privacyModeEnabledStorageKey = 'privacyModeEnabled'
export const privacyModeEnabledStorageKeyManager =
  settingsStorageKeyMaker<boolean>({
    key: privacyModeEnabledStorageKey,
    parser: (data) => Boolean(parseBoolean(data)),
  })

// Settings - Currency
export const currencyStorageKey = 'currencySymbol'
export const currencyStorageKeyManager =
  settingsStorageKeyMaker<Portfolio.Currency.Symbol>({
    key: currencyStorageKey,
    parser: (data) => {
      const parsed = parseCurrencySymbol(parseSafe(data))
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

// App Messages
export const appMessagesStorage = rootSyncStorage.join('appMessages/')
export const appMessagesObservableStorage =
  observableStorageMaker(appMessagesStorage)
const appMessagesStorageKeyMaker = storageKeyMaker(appMessagesObservableStorage)

// App Messages - Network Notice
export const hasShownNetworkNoticeStorageKey = 'hasShownNetworkNotice'
export const hasShownNetworkNoticeStorageKeyManager =
  appMessagesStorageKeyMaker<boolean>({
    key: hasShownNetworkNoticeStorageKey,
    parser: (data) => Boolean(parseBoolean(data)),
  })

// Debug storage
const observableFunction = (v: unknown) => {
  logger.debug('key with value updated', {value: v})
  return of(null)
}
appSettingsObservableStorage.observable.subscribe((v) => {
  observableFunction(v)
  debugStorage(rootMMKV)
})
appMessagesObservableStorage.observable.subscribe((v) => {
  observableFunction(v)
  debugStorage(rootMMKV)
})
