import {AsyncStorageProvider} from '@yoroi/common'
import {LinksProvider} from '@yoroi/links'
import {SetupWalletProvider} from '@yoroi/setup-wallet'
import {ThemeProvider} from '@yoroi/theme'
import React from 'react'
import {LogBox, StyleSheet} from 'react-native'
import * as RNP from 'react-native-paper'
import {initialWindowMetrics, SafeAreaProvider} from 'react-native-safe-area-context'
import {enableFreeze, enableScreens} from 'react-native-screens'
import {QueryClient, QueryClientProvider} from 'react-query'

import {LoadingBoundary} from './components'
import {ErrorBoundary} from './components/ErrorBoundary'
import {AuthProvider} from './features/Auth/AuthProvider'
import {CurrencyProvider} from './features/Settings/Currency/CurrencyContext'
import {walletManager} from './features/WalletManager/common/walletManager'
import {SelectedWalletProvider} from './features/WalletManager/context/SelectedWalletContext'
import {SelectedWalletMetaProvider} from './features/WalletManager/context/SelectedWalletMetaContext'
import {WalletManagerProvider} from './features/WalletManager/context/WalletManagerContext'
import {InitApp} from './InitApp'
import {disableLogbox, loggerFilter} from './kernel/env'
import {LanguageProvider} from './kernel/i18n'
import {useSetupLogger} from './kernel/logger/hooks/useSetupLogger'
import {makeMetricsManager, MetricsProvider} from './kernel/metrics/metricsManager'
import {useMigrations} from './kernel/storage/migrations/useMigrations'
import {rootStorage} from './kernel/storage/rootStorage'
import {useThemeStorageMaker} from './yoroi-wallets/hooks'

enableScreens(true)
enableFreeze(true)

if (disableLogbox) {
  LogBox.ignoreAllLogs()
} else {
  LogBox.ignoreLogs(['Require cycle:'])
}

const queryClient = new QueryClient()
const metricsManager = makeMetricsManager()

const Yoroi = () => {
  const isMigrated = useMigrations(rootStorage)
  const themeStorage = useThemeStorageMaker()

  if (!isMigrated) return null

  return (
    <AsyncStorageProvider storage={rootStorage}>
      <ThemeProvider storage={themeStorage}>
        <ErrorBoundary>
          <MetricsProvider metricsManager={metricsManager}>
            <WalletManagerProvider walletManager={walletManager}>
              <QueryClientProvider client={queryClient}>
                <LoadingBoundary style={StyleSheet.absoluteFill}>
                  <LanguageProvider>
                    <CurrencyProvider>
                      <AuthProvider>
                        <SelectedWalletMetaProvider>
                          <SelectedWalletProvider>
                            <LinksProvider>
                              <SetupWalletProvider>
                                <InitApp />
                              </SetupWalletProvider>
                            </LinksProvider>
                          </SelectedWalletProvider>
                        </SelectedWalletMetaProvider>
                      </AuthProvider>
                    </CurrencyProvider>
                  </LanguageProvider>
                </LoadingBoundary>
              </QueryClientProvider>
            </WalletManagerProvider>
          </MetricsProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </AsyncStorageProvider>
  )
}

export const YoroiApp = () => {
  const isReady = useSetupLogger(loggerFilter)

  if (!isReady) return null

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <RNP.Provider>
        <Yoroi />
      </RNP.Provider>
    </SafeAreaProvider>
  )
}
