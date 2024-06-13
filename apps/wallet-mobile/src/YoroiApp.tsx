import {AsyncStorageProvider} from '@yoroi/common'
import {LinksProvider} from '@yoroi/links'
import {SetupWalletProvider} from '@yoroi/setup-wallet'
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
import {SelectedWalletProvider} from './features/WalletManager/Context/SelectedWalletContext'
import {SelectedWalletMetaProvider} from './features/WalletManager/Context/SelectedWalletMetaContext'
import {LanguageProvider} from './i18n'
import {InitApp} from './InitApp'
import {CONFIG} from './legacy/config'
import {setLogLevel} from './legacy/logging'
import {makeMetricsManager, MetricsProvider} from './metrics/metricsManager'
import {useMigrations} from './migrations/useMigrations'
import {PoolTransitionProvider} from './Staking/PoolTransition/PoolTransitionProvider'
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
      <ThemeProvider>
        <MetricsProvider metricsManager={metricsManager}>
          <WalletManagerProvider walletManager={walletManager}>
            <ErrorBoundary>
              <QueryClientProvider client={queryClient}>
                <LoadingBoundary style={StyleSheet.absoluteFill}>
                  <LanguageProvider>
                    <CurrencyProvider>
                      <SafeAreaProvider>
                        <RNP.Provider>
                          <AuthProvider>
                            <SelectedWalletMetaProvider>
                              <SelectedWalletProvider>
                                <LinksProvider>
                                  <SetupWalletProvider>
                                    <PoolTransitionProvider>
                                      <InitApp />
                                    </PoolTransitionProvider>
                                  </SetupWalletProvider>
                                </LinksProvider>
                              </SelectedWalletProvider>
                            </SelectedWalletMetaProvider>
                          </AuthProvider>
                        </RNP.Provider>
                      </SafeAreaProvider>
                    </CurrencyProvider>
                  </LanguageProvider>
                </LoadingBoundary>
              </QueryClientProvider>
            </ErrorBoundary>
          </WalletManagerProvider>
        </MetricsProvider>
      </ThemeProvider>
    </AsyncStorageProvider>
  )
}
