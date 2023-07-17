import React from 'react'
import {LogBox, Platform, StyleSheet, UIManager} from 'react-native'
import Config from 'react-native-config'
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
import {initMetrics} from './metrics'
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
initMetrics()

// eslint-disable-next-line no-extra-boolean-cast
if (Boolean(Config.DISABLE_LOGBOX)) LogBox.ignoreAllLogs()

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
