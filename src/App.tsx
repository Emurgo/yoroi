import 'intl'

import React, {useEffect} from 'react'
import {Platform, UIManager} from 'react-native'
import * as RNP from 'react-native-paper'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {enableScreens} from 'react-native-screens'
import {useDispatch} from 'react-redux'

import AppNavigator, {StoryBookNavigator} from './AppNavigator'
import {AuthProvider} from './auth/AuthProvider'
import {initApp} from './legacy/actions'
import env from './legacy/env'
import {SelectedWalletMetaProvider, SelectedWalletProvider} from './SelectedWallet'
import {StorageProvider} from './Storage'

enableScreens()
const IS_STORYBOOK = env.getBoolean('IS_STORYBOOK', false)

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
          <StorageProvider>
            <SelectedWalletMetaProvider>
              <SelectedWalletProvider>
                {IS_STORYBOOK ? <StoryBookNavigator /> : <AppNavigator />}
              </SelectedWalletProvider>
            </SelectedWalletMetaProvider>
          </StorageProvider>
        </AuthProvider>
      </RNP.Provider>
    </SafeAreaProvider>
  )
}

const useInitApp = () => {
  const [loaded, setLoaded] = React.useState(false)
  const dispatch = useDispatch()
  useEffect(() => {
    const load = async () => {
      await dispatch(initApp())
      setLoaded(true)
    }

    load()
  }, [dispatch])

  return loaded
}

export default App
