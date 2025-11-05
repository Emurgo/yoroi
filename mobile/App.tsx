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

import messaging from '@react-native-firebase/messaging'
import * as Sentry from '@sentry/react-native'
import * as Updates from 'expo-updates'
import * as React from 'react'

import {BrowserProvider} from '~/features/Discover/common/BrowserProvider'
import {PortfolioTokenActivityProvider} from '~/features/Portfolio/context/PortfolioTokenActivityProvider'
import {ReceiveProvider} from '~/features/Receive/common/ReceiveProvider'
import {ReviewTxProvider} from '~/features/ReviewTx/common/ReviewTxProvider'
import {isDev} from '~/kernel/constants'
import {logger} from '~/kernel/logger/logger'
import {AppNavigator} from '~/kernel/navigation/AppNavigator'
import {Boundary} from '~/ui/Boundary/Boundary'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {ScrollViewProvider} from '~/ui/ScrollView/context/ScrollViewContext'

import {PlatformShell} from './PlatformShell'
import {AuthProvider} from './src/features/Auth/context/AuthProvider'
import {CopyProvider} from './src/features/Copy/context/CopyProvider'
import {YoroiNotificationManager} from './src/features/Notifications/common/YoroiNotificationManager'
import {PairingProvider} from './src/features/Pairing/context/PairingProvider'
import {SearchProvider} from './src/features/Search/SearchContext'
import {CurrencyProvider} from './src/features/Settings/context/CurrencyProvider'
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
                <LoadingOverlayProvider>
                  <Boundary loading={{size: 'full'}}>
                    <ScrollViewProvider>{children}</ScrollViewProvider>
                  </Boundary>
                </LoadingOverlayProvider>
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
                                <ReceiveProvider>{children}</ReceiveProvider>
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

async function checkForUpdates() {
  try {
    const update = await Updates.checkForUpdateAsync()
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync()
      await Updates.reloadAsync()
    }
  } catch (error) {
    logger.error(error as Error, {origin: 'checkForUpdates'})
  }
}

export default Sentry.wrap(function App() {
  React.useEffect(() => {
    if (!isDev) checkForUpdates()
  }, [])

  React.useEffect(() => {
    const register = async () => {
      try {
        await messaging().registerDeviceForRemoteMessages()
        await messaging().requestPermission()
        const token = await messaging().getToken()
        console.log('FCM token:', token)
      } catch {}
    }
    register()
  }, [])

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
})
