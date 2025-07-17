/* import {AsyncStorageProvider} from '@yoroi/common'
import {ThemeProvider} from '@yoroi/theme' */

import * as Font from 'expo-font'
import * as React from 'react'

import {Text} from 'react-native'
import {PlatformShell} from './PlatformShell'
import {AuthProvider} from './src/features/Auth/context/AuthProvider'
import {PairingProvider} from './src/features/Pairing/context/PairingProvider'
import {WalletManagerProvider} from './src/features/WalletManager/context/WalletManagerProvider'
import {walletManager} from './src/features/WalletManager/wallet-manager'
import {useMigrations} from './src/kernel/storage/migrations/useMigrations'
import {
  authStorageKeyManager,
  currencyStorageKeyManager,
  installationIdStorageKeyManager,
  pinStorageKeyManager,
  rootStorage,
} from './src/kernel/storage/storages'

function AppShell({children}: React.PropsWithChildren) {
  const isMigrated = useMigrations(rootStorage)

  if (!isMigrated) return null

  return <Text>TESTSTS</Text>
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

  return <Text>TESTSTS</Text>
}

function BusinessShell({children}: React.PropsWithChildren) {
  return (
    <AuthProvider
      authStorageKeyManager={authStorageKeyManager}
      pinStorageKeyManager={pinStorageKeyManager}
      installationIdKeyManager={installationIdStorageKeyManager}
    >
      <PairingProvider currencyStorageKeyManager={currencyStorageKeyManager}>
        <WalletManagerProvider walletManager={walletManager}>
          {children}
        </WalletManagerProvider>
      </PairingProvider>
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
