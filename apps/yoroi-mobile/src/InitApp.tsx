import React, {useEffect} from 'react'
import {Platform, UIManager} from 'react-native'
import {enableScreens} from 'react-native-screens'
import uuid from 'uuid'

import {AppNavigator} from './AppNavigator'
import {useStorage, YoroiStorage} from './yoroi-wallets/storage'
import {walletManager} from './yoroi-wallets/walletManager'

enableScreens()

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental != null) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

export const InitApp = () => {
  const loaded = useInitApp()

  if (!loaded) return null

  return <AppNavigator />
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

const initInstallationId = async (storage: YoroiStorage) => {
  const installationId = await storage.join('appSettings/').getItem('installationId', (data) => data) // LEGACY: installationId is not serialized
  if (installationId != null) return installationId

  const newInstallationId = uuid.v4()
  await storage.setItem('appSettings/installationId', newInstallationId, () => newInstallationId) // LEGACY: installationId is not serialized
}

export const initApp = async (storage: YoroiStorage) => {
  await initInstallationId(storage)
  await walletManager.initialize()
}
