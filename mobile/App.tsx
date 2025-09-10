import {AsyncStorageProvider} from '@yoroi/common'
import {LinksProvider} from '@yoroi/links'
import {SetupWalletProvider} from '@yoroi/setup-wallet'
import {
  CatalystProvider,
  catalystApiMaker,
  catalystManagerMaker,
} from '@yoroi/staking'
import {ThemeProvider} from '@yoroi/theme'
import {TransferProvider} from '@yoroi/transfer'

import * as React from 'react'

import {BrowserProvider} from '~/features/Discover/common/BrowserProvider'
import {PortfolioTokenActivityProvider} from '~/features/Portfolio/context/PortfolioTokenActivityProvider'
import {ReviewTxProvider} from '~/features/ReviewTx/common/ReviewTxProvider'
import {AppNavigator} from '~/kernel/navigation/AppNavigator'
import {Modal} from '~/ui/Modal/ModalScreen'

import {PlatformShell} from './PlatformShell'
import {AuthProvider} from './src/features/Auth/context/AuthProvider'
import {CopyProvider} from './src/features/Copy/context/CopyProvider'
import {YoroiNotificationManager} from './src/features/Notifications/common/YoroiNotificationManager'
import {PairingProvider} from './src/features/Pairing/context/PairingProvider'
import {SearchProvider} from './src/features/Search/SearchContext'
import {CurrencyProvider} from './src/features/Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {AutomaticWalletOpenerProvider} from './src/features/WalletManager/context/AutomaticWalletOpeningProvider'
import {WalletManagerProvider} from './src/features/WalletManager/context/WalletManagerProvider'
import {walletManager} from './src/features/WalletManager/wallet-manager'
import {useFonts} from './src/hooks/useFonts'
import {ConnectionProvider} from './src/kernel/connection/ConnectionProvider'
import {LanguageProvider} from './src/kernel/i18n/LanguageProvider'
import {useMigrations} from './src/kernel/storage/migrations/useMigrations'
import {
  authStorageKeyManager,
  currencyStorageKeyManager,
  installationIdStorageKeyManager,
  languageStorageKeyManager,
  pinStorageKeyManager,
  rootStorage,
  themeStorageKeyManager,
} from './src/kernel/storage/storages'
import {CrashBoundary} from './src/ui/CrashBoundary/CrashBoundary'
import {LoadingOverlayProvider} from './src/ui/LoadingOverlay/context'

const catalystApi = catalystApiMaker()
const catalystManager = catalystManagerMaker({
  api: catalystApi,
})

function AppShell({children}: React.PropsWithChildren) {
  const isMigrated = useMigrations(rootStorage)
  const isLoaded = useFonts()

  if (!isMigrated || !isLoaded) return null

  return (
    <AsyncStorageProvider storage={rootStorage}>
      <ConnectionProvider>
        <ThemeProvider storage={themeStorageKeyManager}>
          <LanguageProvider storage={languageStorageKeyManager}>
            <CopyProvider>
              <CrashBoundary>
                <LoadingOverlayProvider>{children}</LoadingOverlayProvider>
              </CrashBoundary>
            </CopyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </ConnectionProvider>
    </AsyncStorageProvider>
  )
}

function BusinessShell({children}: React.PropsWithChildren) {
  return (
    <AuthProvider
      authStorageKeyManager={authStorageKeyManager}
      pinStorageKeyManager={pinStorageKeyManager}
      installationIdKeyManager={installationIdStorageKeyManager}
    >
      <SearchProvider>
        <PairingProvider currencyStorageKeyManager={currencyStorageKeyManager}>
          <WalletManagerProvider walletManager={walletManager}>
            <PortfolioTokenActivityProvider>
              <AutomaticWalletOpenerProvider>
                <TransferProvider>
                  <ReviewTxProvider>
                    <SetupWalletProvider>
                      <BrowserProvider>
                        <LinksProvider>
                          <YoroiNotificationManager>
                            <CurrencyProvider>
                              <CatalystProvider manager={catalystManager}>
                                {children}
                              </CatalystProvider>
                            </CurrencyProvider>
                          </YoroiNotificationManager>
                        </LinksProvider>
                      </BrowserProvider>
                    </SetupWalletProvider>
                  </ReviewTxProvider>
                </TransferProvider>
              </AutomaticWalletOpenerProvider>
            </PortfolioTokenActivityProvider>
          </WalletManagerProvider>
        </PairingProvider>
      </SearchProvider>
    </AuthProvider>
  )
}

export default function App() {
  return (
    <AppShell>
      <BusinessShell>
        <PlatformShell>
          <Modal />
          <AppNavigator />
        </PlatformShell>
      </BusinessShell>
    </AppShell>
  )
}
