import {AsyncStorageProvider} from '@yoroi/common'
import {LinksProvider} from '@yoroi/links'
import {
  ResolverProvider,
  resolverApiMaker,
  resolverManagerMaker,
  resolverStorageMaker,
} from '@yoroi/resolver'
import {SetupWalletProvider} from '@yoroi/setup-wallet'
import {
  CatalystProvider,
  catalystApiMaker,
  catalystManagerMaker,
} from '@yoroi/staking'
import {ThemeProvider} from '@yoroi/theme'
import {TransferProvider} from '@yoroi/transfer'
import {Resolver} from '@yoroi/types'
import {
  AutomaticWalletOpenerProvider,
  WalletManagerHydrationWrapper,
  WalletManagerProvider,
  makeWalletManager,
  useSelectedNetwork,
} from '@yoroi/wallet-manager'

import {init} from '@emurgo/cross-csl-mobile'
import * as Sentry from '@sentry/react-native'
import * as Updates from 'expo-updates'
import * as React from 'react'

import {useFonts} from '~/common/hooks/useFonts'
import {networkManagers} from '~/common/network-managers'
import {createCardanoWalletDependencies} from '~/common/wallet-dependencies'
import {BrowserProvider} from '~/features/Discover/common/BrowserProvider'
import {PortfolioTokenActivityProvider} from '~/features/Portfolio/context/PortfolioTokenActivityProvider'
import {ReceiveProvider} from '~/features/Receive/common/ReceiveProvider'
import {isDev} from '~/kernel/constants'
import {logger} from '~/kernel/logger/logger'
import {AppNavigator} from '~/kernel/navigation/AppNavigator'
import {Keychain} from '~/kernel/storage/Keychain'
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
import {ConnectionProvider} from './src/kernel/connection/ConnectionProvider'
import {unstoppableApiKey} from './src/kernel/constants'
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

// Create wallet manager instance with app-specific dependencies
const walletManager = makeWalletManager({
  networkManagers,
  rootStorage,
  keychainManager: Keychain,
  cardanoWalletDependencies: createCardanoWalletDependencies(),
})

function AppShell({children}: React.PropsWithChildren) {
  const isMigrated = useMigrations(rootStorage)
  const isLoaded = useFonts()

  // Wait for migrations and fonts to load
  // useMigrations handles errors internally by clearing storage if needed
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
          <WalletManagerHydrationWrapper walletManager={walletManager}>
            <WalletManagerProvider walletManager={walletManager}>
              <ResolverProviderWrapper>
                <PortfolioTokenActivityProvider>
                  <AutomaticWalletOpenerProvider>
                    <TransferProvider>
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
                    </TransferProvider>
                  </AutomaticWalletOpenerProvider>
                </PortfolioTokenActivityProvider>
              </ResolverProviderWrapper>
            </WalletManagerProvider>
          </WalletManagerHydrationWrapper>
        </PairingProvider>
      </SearchProvider>
    </AuthProvider>
  )
}

// ResolverProvider wrapper that uses the selected network
// This provides resolver functionality to both SetupWallet and Send flows
const ResolverProviderWrapper = ({children}: React.PropsWithChildren) => {
  const {networkManager} = useSelectedNetwork()
  const isMainnet = networkManager.isMainnet

  const resolverStorage = React.useMemo(() => {
    return resolverStorageMaker()
  }, [])

  const resolverApi = React.useMemo(() => {
    return resolverApiMaker({
      apiConfig: {
        [Resolver.NameServer.Unstoppable]: {
          apiKey: unstoppableApiKey,
        },
      },
      cslFactory: init,
      isMainnet,
    })
  }, [isMainnet])

  const resolverManager = React.useMemo(() => {
    return resolverManagerMaker(resolverStorage, resolverApi)
  }, [resolverStorage, resolverApi])

  return (
    <ResolverProvider resolverManager={resolverManager}>
      {children}
    </ResolverProvider>
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
