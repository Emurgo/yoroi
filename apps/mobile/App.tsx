import {AsyncStorageProvider} from '@yoroi/common'
import {SetupWalletProvider} from '@yoroi/setup-wallet'
import {ThemeProvider} from '@yoroi/theme'

import * as Font from 'expo-font'
import * as React from 'react'

import {PlatformShell} from './PlatformShell'
import {AuthProvider} from './src/features/Auth/context/AuthProvider'
import {CopyProvider} from './src/features/Copy/context/CopyProvider'
import {PairingProvider} from './src/features/Pairing/context/PairingProvider'
import {SearchProvider} from './src/features/Search/SearchContext'
import {WalletManagerProvider} from './src/features/WalletManager/context/WalletManagerProvider'
import {walletManager} from './src/features/WalletManager/wallet-manager'
import {ConnectionProvider} from './src/kernel/connection/ConnectionProvider'
import {LanguageProvider} from './src/kernel/i18n/LanguageProvider'
import {AppNavigator} from './src/kernel/navigation/AppNavigator'
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

function AppShell({children}: React.PropsWithChildren) {
  const isMigrated = useMigrations(rootStorage)

  if (!isMigrated) return null

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

function Yoroi() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false)

  React.useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Rubik': require('./assets/fonts/Rubik-Regular.ttf'),
        'Rubik-Regular': require('./assets/fonts/Rubik-Regular.ttf'),
        'Rubik-Medium': require('./assets/fonts/Rubik-Medium.ttf'),
        'Rubik-Bold': require('./assets/fonts/Rubik-Bold.ttf'),
        'Rubik-Light': require('./assets/fonts/Rubik-Light.ttf'),
        'Rubik-SemiBold': require('./assets/fonts/Rubik-SemiBold.ttf'),
        'Rubik-Black': require('./assets/fonts/Rubik-Black.ttf'),
        'Rubik-ExtraBold': require('./assets/fonts/Rubik-ExtraBold.ttf'),
        'Rubik-Italic': require('./assets/fonts/Rubik-Italic.ttf'),
        'Rubik-MediumItalic': require('./assets/fonts/Rubik-MediumItalic.ttf'),
        'Rubik-BoldItalic': require('./assets/fonts/Rubik-BoldItalic.ttf'),
        'Rubik-LightItalic': require('./assets/fonts/Rubik-LightItalic.ttf'),
        'Rubik-SemiBoldItalic': require('./assets/fonts/Rubik-SemiBoldItalic.ttf'),
        'Rubik-BlackItalic': require('./assets/fonts/Rubik-BlackItalic.ttf'),
        'Rubik-ExtraBoldItalic': require('./assets/fonts/Rubik-ExtraBoldItalic.ttf'),
      })
      setFontsLoaded(true)
    }
    loadFonts()
  }, [])

  if (!fontsLoaded) {
    return null
  }

  return <AppNavigator />
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
            <SetupWalletProvider>{children}</SetupWalletProvider>
          </WalletManagerProvider>
        </PairingProvider>
      </SearchProvider>
    </AuthProvider>
  )
}

export default function App() {
  return (
    <AppShell>
      <PlatformShell>
        <BusinessShell>
          <Yoroi />
        </BusinessShell>
      </PlatformShell>
    </AppShell>
  )
}
