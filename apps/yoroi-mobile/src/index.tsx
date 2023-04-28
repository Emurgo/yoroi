/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {createIntl, createIntlCache} from 'react-intl'
import {LogBox, StyleSheet} from 'react-native'
import {QueryClient, QueryClientProvider} from 'react-query'

import App from './App'
import {LoadingBoundary} from './components'
import {ErrorBoundary} from './components/ErrorBoundary'
import {handleGeneralError} from './dialogs'
import {LanguageProvider} from './i18n'
import translations from './i18n/translations'
import {CONFIG} from './legacy/config'
import {Logger, setLogLevel} from './legacy/logging'
import {CurrencyProvider} from './Settings/Currency/CurrencyContext'
import {ThemeProvider} from './theme'
import {isEmptyString} from './utils/utils'
import {WalletManagerProvider} from './WalletManager'
import {ApiError, NetworkError} from './yoroi-wallets/cardano/errors'
import {useMigrations} from './yoroi-wallets/migrations'
import {storage, StorageProvider} from './yoroi-wallets/storage'
import {walletManager} from './yoroi-wallets/walletManager'

setLogLevel(CONFIG.LOG_LEVEL)

LogBox.ignoreLogs([
  // react navigation didn't port everything
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  // react-query default cacheTime (not an issue)
  'Setting a timer for a long period of time, i.e. multiple minutes, is a performance and correctness issue on Android as it keeps the timer module awake, and timers can only be called when the app is in the foreground. See https://github.com/facebook/react-native/issues/12981 for more info.',
  // react navigation fix old params
  'Non-serializable values were found in the navigation state.',
])

const cache = createIntlCache()
const intl = createIntl({locale: 'en-US', messages: translations['en-US']}, cache)
global.onunhandledrejection = (error: any) => {
  Logger.error(`${error}`)
  if (error instanceof NetworkError) return
  if (error instanceof ApiError) return
  if (isEmptyString(error?.message)) return
  handleGeneralError(error.message, intl)
}

const queryClient = new QueryClient()

export const YoroiApp = () => {
  const migrated = useMigrations(storage)

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return migrated ? (
    <StorageProvider>
      <WalletManagerProvider walletManager={walletManager}>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <LoadingBoundary style={StyleSheet.absoluteFill}>
              <ThemeProvider>
                <LanguageProvider>
                  <CurrencyProvider>
                    <App />
                  </CurrencyProvider>
                </LanguageProvider>
              </ThemeProvider>
            </LoadingBoundary>
          </QueryClientProvider>
        </ErrorBoundary>
      </WalletManagerProvider>
    </StorageProvider>
  ) : null
}
