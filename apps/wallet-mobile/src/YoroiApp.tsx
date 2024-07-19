import {AsyncStorageProvider} from '@yoroi/common'
import {LinksProvider} from '@yoroi/links'
import {SetupWalletProvider} from '@yoroi/setup-wallet'
import {ThemeProvider} from '@yoroi/theme'
import React from 'react'
import {LogBox, StyleSheet} from 'react-native'
import * as RNP from 'react-native-paper'
import {initialWindowMetrics, SafeAreaProvider} from 'react-native-safe-area-context'
import {enableFreeze, enableScreens} from 'react-native-screens'
import {QueryClientProvider} from 'react-query'

import {LoadingBoundary} from './components'
import {ErrorBoundary} from './components/ErrorBoundary'
import {AuthProvider} from './features/Auth/AuthProvider'
import {BrowserProvider} from './features/Discover/common/BrowserProvider'
import {CurrencyProvider} from './features/Settings/Currency/CurrencyContext'
import {WalletManagerProvider} from './features/WalletManager/context/WalletManagerProvider'
import {walletManager} from './features/WalletManager/wallet-manager'
import {InitApp} from './InitApp'
import {disableLogbox /* loggerFilter */} from './kernel/env'
import {LanguageProvider} from './kernel/i18n'
// import {useSetupLogger} from './kernel/logger/hooks/useSetupLogger'
import {makeMetricsManager, MetricsProvider} from './kernel/metrics/metricsManager'
import {queryInfo} from './kernel/query-client'
import {useMigrations} from './kernel/storage/migrations/useMigrations'
import {rootStorage} from './kernel/storage/rootStorage'
import {PoolTransitionProvider} from './legacy/Staking/PoolTransition/PoolTransitionProvider'
import {useThemeStorageMaker} from './yoroi-wallets/hooks'

enableScreens(true)
enableFreeze(true)

if (disableLogbox) {
  LogBox.ignoreAllLogs()
} else {
  LogBox.ignoreLogs(['Require cycle:'])
}

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
            <QueryClientProvider client={queryInfo.queryClient}>
              <CurrencyProvider>
                <WalletManagerProvider walletManager={walletManager}>
                  <LoadingBoundary style={StyleSheet.absoluteFill}>
                    <LanguageProvider>
                      <AuthProvider>
                        <LinksProvider>
                          <SetupWalletProvider>
                            <PoolTransitionProvider>
                              <BrowserProvider>
                                <InitApp />
                              </BrowserProvider>
                            </PoolTransitionProvider>
                          </SetupWalletProvider>
                        </LinksProvider>
                      </AuthProvider>
                    </LanguageProvider>
                  </LoadingBoundary>
                </WalletManagerProvider>
              </CurrencyProvider>
            </QueryClientProvider>
          </MetricsProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </AsyncStorageProvider>
  )
}

export const YoroiApp = () => {
  /* const isReady = useSetupLogger(loggerFilter)

  if (!isReady) return null */

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <RNP.Provider>
        <Yoroi />
      </RNP.Provider>
    </SafeAreaProvider>
  )
}
