import 'intl'

import AsyncStorage, {AsyncStorageStatic} from '@react-native-async-storage/async-storage'
import React, {useEffect} from 'react'
import {Platform, UIManager} from 'react-native'
import * as RNP from 'react-native-paper'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {enableScreens} from 'react-native-screens'
import uuid from 'uuid'

import AppNavigator from './AppNavigator'
import {AuthProvider} from './auth/AuthProvider'
import {getCrashReportsEnabled} from './hooks'
import crashReporting from './legacy/crashReporting'
import {SelectedWalletMetaProvider, SelectedWalletProvider} from './SelectedWallet'
import {walletManager} from './yoroi-wallets'

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

  useEffect(() => {
    const load = async () => {
      await initApp(AsyncStorage)
      setLoaded(true)
    }

    load()
  }, [])

  return loaded
}

export default App

const initInstallationId = async (storage: AsyncStorageStatic) => {
  const installationId = await storage.getItem('appSettings/installationId') // LEGACY: installationId is not serialized
  if (installationId != null) return installationId

  const newInstallationId = uuid.v4()
  await storage.setItem('appSettings/installationId', newInstallationId) // LEGACY: installationId is not serialized
  return newInstallationId
}

export const initApp = async (storage: AsyncStorageStatic) => {
  const installationId = await initInstallationId(storage)

  const crashReportsEnabled = await getCrashReportsEnabled()
  if (crashReportsEnabled) {
    crashReporting.setUserId(installationId)
    crashReporting.enable()
  }

  await walletManager.initialize()
}
