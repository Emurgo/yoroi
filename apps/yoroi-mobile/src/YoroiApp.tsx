/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {LogBox, Platform, StyleSheet, UIManager} from 'react-native'
import * as RNP from 'react-native-paper'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {enableScreens} from 'react-native-screens'
import {QueryClient, QueryClientProvider} from 'react-query'

import {AuthProvider} from './auth/AuthProvider'
import {LoadingBoundary} from './components'
import {ErrorBoundary} from './components/ErrorBoundary'
import {LanguageProvider} from './i18n'
import {InitApp} from './InitApp'
import {CONFIG} from './legacy/config'
import {setLogLevel} from './legacy/logging'
import {SelectedWalletMetaProvider, SelectedWalletProvider} from './SelectedWallet/Context'
import {CurrencyProvider} from './Settings/Currency/CurrencyContext'
import {ThemeProvider} from './theme'
import {WalletManagerProvider} from './WalletManager'
import {useMigrations} from './yoroi-wallets/migrations'
import {storage, StorageProvider} from './yoroi-wallets/storage'
import {walletManager} from './yoroi-wallets/walletManager'

enableScreens()

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental != null) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

setLogLevel(CONFIG.LOG_LEVEL)

LogBox.ignoreLogs([
  // react navigation didn't port everything
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  // react-query default cacheTime (not an issue)
  'Setting a timer for a long period of time, i.e. multiple minutes, is a performance and correctness issue on Android as it keeps the timer module awake, and timers can only be called when the app is in the foreground. See https://github.com/facebook/react-native/issues/12981 for more info.',
  // react navigation fix old params
  'Non-serializable values were found in the navigation state.',
])

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
                    <SafeAreaProvider>
                      <RNP.Provider>
                        <AuthProvider>
                          <SelectedWalletMetaProvider>
                            <SelectedWalletProvider>
                              <InitApp />
                            </SelectedWalletProvider>
                          </SelectedWalletMetaProvider>
                        </AuthProvider>
                      </RNP.Provider>
                    </SafeAreaProvider>
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
