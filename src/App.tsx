import 'intl'

import React, {useEffect} from 'react'
import {AppState, AppStateStatus, Platform, UIManager} from 'react-native'
import RNBootSplash from 'react-native-bootsplash'
import * as RNP from 'react-native-paper'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {enableScreens} from 'react-native-screens'
import {useDispatch} from 'react-redux'

import AppNavigator from './AppNavigator'
import {AuthProvider} from './auth/AuthProvider'
import {initApp} from './legacy/actions'
import {SelectedWalletMetaProvider, SelectedWalletProvider} from './SelectedWallet'
import {StorageProvider} from './Storage'

enableScreens()

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental != null) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

const App = () => {
  useHideScreenInAppSwitcher()

  const loaded = useInitApp()

  if (!loaded) return null

  return (
    <SafeAreaProvider>
      <RNP.Provider>
        <AuthProvider>
          <StorageProvider>
            <SelectedWalletMetaProvider>
              <SelectedWalletProvider>
                <AppNavigator />
              </SelectedWalletProvider>
            </SelectedWalletMetaProvider>
          </StorageProvider>
        </AuthProvider>
      </RNP.Provider>
    </SafeAreaProvider>
  )
}

export default App

const useInitApp = () => {
  const [loaded, setLoaded] = React.useState(false)
  const dispatch = useDispatch()
  useEffect(() => {
    const load = async () => {
      await dispatch(initApp())
      setLoaded(true)
      setTimeout(() => RNBootSplash.hide({fade: true}), 200)
    }

    load()
  }, [dispatch])

  return loaded
}

const useHideScreenInAppSwitcher = () => {
  const appStateRef = React.useRef(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (Platform.OS !== 'ios') return

      const isFocused = (appState: AppStateStatus) => appState === 'active'
      const isBlurred = (appState: AppStateStatus) => appState === 'inactive' || appState === 'background'

      if (isBlurred(appStateRef.current) && isFocused(nextAppState)) RNBootSplash.hide({fade: true})
      if (isFocused(appStateRef.current) && isBlurred(nextAppState)) RNBootSplash.show({fade: true})

      appStateRef.current = nextAppState
    })

    return () => subscription?.remove()
  }, [])
}
