import 'intl'

import React, {useEffect} from 'react'
import {AppState, AppStateStatus, Platform} from 'react-native'
import RNBootSplash from 'react-native-bootsplash'
import * as RNP from 'react-native-paper'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {enableScreens} from 'react-native-screens'
import {useDispatch} from 'react-redux'

import {initApp} from '../legacy/actions'
import AppNavigator from './AppNavigator'

enableScreens()

const useInitializeApp = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(initApp())
  }, [dispatch])
}

const useHideScreenInAppSwitcher = () => {
  const appStateRef = React.useRef(AppState.currentState)

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus): void => {
      if (Platform.OS !== 'ios') return

      const isFocused = (appState: string | void) => appState?.match(/active/)
      const isBlurred = (appState: string | void) => appState?.match(/inactive|background/)

      if (isBlurred(appStateRef.current) && isFocused(nextAppState)) RNBootSplash.hide({fade: true})
      if (isFocused(appStateRef.current) && isBlurred(nextAppState)) RNBootSplash.show({fade: true})

      appStateRef.current = nextAppState
    }

    AppState.addEventListener('change', handleAppStateChange)

    return () => {
      AppState.removeEventListener('change', handleAppStateChange)
    }
  }, [])
}

const App = () => {
  useHideScreenInAppSwitcher()
  useInitializeApp()

  return (
    <SafeAreaProvider>
      <RNP.Provider>
        <AppNavigator />
      </RNP.Provider>
    </SafeAreaProvider>
  )
}

export default App
