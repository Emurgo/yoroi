import 'intl'

import React, {useEffect} from 'react'
import {Platform, UIManager} from 'react-native'
import * as RNP from 'react-native-paper'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {enableScreens} from 'react-native-screens'

import AppNavigator from './AppNavigator'
import {AuthProvider} from './auth/AuthProvider'
import {initApp} from './legacy/actions'
import {SelectedWalletMetaProvider, SelectedWalletProvider} from './SelectedWallet'
import {useStorage} from './Storage'
import {useWalletManager} from './WalletManager'

enableScreens()

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental != null) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

const App = () => {
  const loaded = useInitApp()

  if (!loaded) return null

  return (
    <SafeAreaProvider>
      <RNP.Provider>
        <AuthProvider>
          <SelectedWalletMetaProvider>
            <SelectedWalletProvider>
              <AppNavigator />
            </SelectedWalletProvider>
          </SelectedWalletMetaProvider>
        </AuthProvider>
      </RNP.Provider>
    </SafeAreaProvider>
  )
}

const useInitApp = () => {
  const [loaded, setLoaded] = React.useState(false)
  const storage = useStorage()
  const walletManager = useWalletManager()

  useEffect(() => {
    const load = async () => {
      await initApp(storage, walletManager)
      setLoaded(true)
    }

    load()
  }, [storage, walletManager])

  return loaded
}

export default App
