import 'intl'

import React, {useEffect} from 'react'
import {AppState, AppStateStatus, Platform, UIManager} from 'react-native'
import RNBootSplash from 'react-native-bootsplash'
import * as RNP from 'react-native-paper'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {enableScreens} from 'react-native-screens'
import {useDispatch, useSelector} from 'react-redux'

import AppNavigator from './AppNavigator'
import {initApp} from './legacy/actions'
import {isAppInitializedSelector} from './legacy/selectors'
import {SelectedWalletMetaProvider, SelectedWalletProvider} from './SelectedWallet'

enableScreens()

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

const useInitializeApp = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(initApp())
  }, [dispatch])
}

const useHideScreenInAppSwitcher = () => {
  const appStateRef = React.useRef(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (Platform.OS !== 'ios') return

      const isFocused = (appState: string | void) => appState?.match(/active/)
      const isBlurred = (appState: string | void) => appState?.match(/inactive|background/)

      if (isBlurred(appStateRef.current) && isFocused(nextAppState)) RNBootSplash.hide({fade: true})
      if (isFocused(appStateRef.current) && isBlurred(nextAppState)) RNBootSplash.show({fade: true})

      appStateRef.current = nextAppState
    })

    return () => subscription?.remove()
  }, [])
}

const App = () => {
  useHideScreenInAppSwitcher()
  useInitializeApp()
  const isAppInitialized = useSelector(isAppInitializedSelector)

  if (!isAppInitialized) return null

  return (
    <SafeAreaProvider>
      <RNP.Provider>
        <SelectedWalletMetaProvider>
          <SelectedWalletProvider>
            <AppNavigator />
          </SelectedWalletProvider>
        </SelectedWalletMetaProvider>
      </RNP.Provider>
    </SafeAreaProvider>
  )
}

export default App
