import {AsyncStorageProvider} from '@yoroi/common'
import {ThemeProvider} from '@yoroi/theme'
import React from 'react'
import {LogBox, Platform, StyleSheet, UIManager} from 'react-native'
import Config from 'react-native-config'
import * as RNP from 'react-native-paper'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {enableFreeze, enableScreens} from 'react-native-screens'
import {QueryClient, QueryClientProvider} from 'react-query'

import {AuthProvider} from './auth/AuthProvider'
import {LoadingBoundary} from './components'
import {ErrorBoundary} from './components/ErrorBoundary'
import {CurrencyProvider} from './features/Settings/Currency/CurrencyContext'
import {LanguageProvider} from './i18n'
import {InitApp} from './InitApp'
import {InitialLinkProvider} from './IntialLinkManagerProvider'
import {CONFIG} from './legacy/config'
import {setLogLevel} from './legacy/logging'
import {makeMetricsManager, MetricsProvider} from './metrics/metricsManager'
import {useMigrations} from './migrations/useMigrations'
import {SelectedWalletMetaProvider, SelectedWalletProvider} from './SelectedWallet/Context'
import {walletManager} from './wallet-manager/walletManager'
import {WalletManagerProvider} from './wallet-manager/WalletManagerContext'
import {rootStorage} from './yoroi-wallets/storage/rootStorage'

enableScreens(true)
enableFreeze(true)

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental != null) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

setLogLevel(CONFIG.LOG_LEVEL)

// eslint-disable-next-line no-extra-boolean-cast
if (Boolean(Config.DISABLE_LOGBOX)) LogBox.ignoreAllLogs()

const queryClient = new QueryClient()

const metricsManager = makeMetricsManager()

export const YoroiApp = () => {
  const migrated = useMigrations(rootStorage)

  if (!migrated) return null

  return (
    <AsyncStorageProvider storage={rootStorage}>
      <MetricsProvider metricsManager={metricsManager}>
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
                                <InitialLinkProvider>
                                  <InitApp />
                                </InitialLinkProvider>
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
      </MetricsProvider>
    </AsyncStorageProvider>
  )
}
