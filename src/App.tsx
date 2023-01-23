import 'intl'

import React, {useEffect} from 'react'
import {Platform, UIManager} from 'react-native'
import * as RNP from 'react-native-paper'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {enableScreens} from 'react-native-screens'

import AppNavigator from './AppNavigator'
import {AuthProvider} from './auth/AuthProvider'
import {initApp} from './legacy/actions'
import {SearchProvider} from './Search'
import {SelectedWalletMetaProvider, SelectedWalletProvider} from './SelectedWallet'
import {useStorage} from './Storage'

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
      <SearchProvider>
        <RNP.Provider>
          <AuthProvider>
            <SelectedWalletMetaProvider>
              <SelectedWalletProvider>
                <AppNavigator />
              </SelectedWalletProvider>
            </SelectedWalletMetaProvider>
          </AuthProvider>
        </RNP.Provider>
      </SearchProvider>
    </SafeAreaProvider>
  )
}

const useInitApp = () => {
  const [loaded, setLoaded] = React.useState(false)
  const storage = useStorage()

  useEffect(() => {
    const load = async () => {
      await initApp(storage)
      setLoaded(true)
    }

    load()
  }, [storage])

  return loaded
}

export default App
