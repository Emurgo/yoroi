import {AsyncStorageProvider} from '@yoroi/common'
import {LinksProvider} from '@yoroi/links'
import {NotificationProvider} from '@yoroi/notifications'
import {SetupWalletProvider} from '@yoroi/setup-wallet'
import {catalystApiMaker, catalystManagerMaker, CatalystProvider} from '@yoroi/staking'
import {ThemeProvider} from '@yoroi/theme'
import {TransferProvider} from '@yoroi/transfer'
import React from 'react'
import {LogBox, StyleSheet} from 'react-native'
import * as RNP from 'react-native-paper'
import {initialWindowMetrics, SafeAreaProvider} from 'react-native-safe-area-context'
import {enableScreens} from 'react-native-screens'
import {QueryClientProvider} from 'react-query'

import {LoadingBoundary} from './components/Boundary/Boundary'
import {ErrorBoundary} from './components/ErrorBoundary/ErrorBoundary'
import {AuthProvider} from './features/Auth/AuthProvider'
import {BrowserProvider} from './features/Discover/common/BrowserProvider'
import {notificationManager} from './features/Notifications/useCases/common/notification-manager'
import {PortfolioTokenActivityProvider} from './features/Portfolio/common/PortfolioTokenActivityProvider'
import {ReviewTxProvider} from './features/ReviewTx/common/ReviewTxProvider'
import {CurrencyProvider} from './features/Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {AutomaticWalletOpenerProvider} from './features/WalletManager/context/AutomaticWalletOpeningProvider'
import {WalletManagerProvider} from './features/WalletManager/context/WalletManagerProvider'
import {walletManager} from './features/WalletManager/wallet-manager'
import {InitApp} from './InitApp'
import {disableLogbox, loggerFilter} from './kernel/env'
import {LanguageProvider} from './kernel/i18n'
import {useSetupLogger} from './kernel/logger/hooks/useSetupLogger'
import {makeMetricsManager, MetricsProvider} from './kernel/metrics/metricsManager'
import {queryInfo} from './kernel/query-client'
import {useMigrations} from './kernel/storage/migrations/useMigrations'
import {rootStorage} from './kernel/storage/rootStorage'
import {PoolTransitionProvider} from './legacy/Staking/PoolTransition/PoolTransitionProvider'
import {useThemeStorageMaker} from './yoroi-wallets/hooks'

enableScreens(true)

if (disableLogbox) {
  LogBox.ignoreAllLogs()
} else {
  LogBox.ignoreLogs(['Require cycle:'])
}
const catalystApi = catalystApiMaker()
const catalystManager = catalystManagerMaker({
  api: catalystApi,
})

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
              <WalletManagerProvider walletManager={walletManager}>
                <CurrencyProvider>
                  <PortfolioTokenActivityProvider>
                    <LoadingBoundary style={StyleSheet.absoluteFill}>
                      <LanguageProvider>
                        <AuthProvider>
                          <TransferProvider>
                            <LinksProvider>
                              <SetupWalletProvider>
                                <PoolTransitionProvider>
                                  <BrowserProvider>
                                    <AutomaticWalletOpenerProvider>
                                      <CatalystProvider manager={catalystManager}>
                                        <ReviewTxProvider>
                                          <NotificationProvider manager={notificationManager}>
                                            <InitApp />
                                          </NotificationProvider>
                                        </ReviewTxProvider>
                                      </CatalystProvider>
                                    </AutomaticWalletOpenerProvider>
                                  </BrowserProvider>
                                </PoolTransitionProvider>
                              </SetupWalletProvider>
                            </LinksProvider>
                          </TransferProvider>
                        </AuthProvider>
                      </LanguageProvider>
                    </LoadingBoundary>
                  </PortfolioTokenActivityProvider>
                </CurrencyProvider>
              </WalletManagerProvider>
            </QueryClientProvider>
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
