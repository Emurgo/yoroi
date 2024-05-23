import {useAsyncStorage} from '@yoroi/common'
import {App} from '@yoroi/types'
import React, {useEffect} from 'react'
import {Platform, UIManager} from 'react-native'
import uuid from 'uuid'

import {AppNavigator} from './AppNavigator'
import {useInitScreenShare} from './features/Settings/ScreenShare'
import {walletManager} from './features/WalletManager/common/walletManager'
import {storageVersionMaker} from './kernel/storage/migrations/storageVersion'

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
  const storage = useAsyncStorage()

  const {initialised: screenShareInitialized} = useInitScreenShare()

  useEffect(() => {
    const load = async () => {
      await initApp(storage)
      setLoaded(true)
    }

    load()
  }, [storage])

  return loaded && screenShareInitialized
}

const initInstallationId = async (storage: App.Storage) => {
  const installationId = await storage.join('appSettings/').getItem('installationId', (data) => data) // LEGACY: installationId is not serialized
  if (installationId != null) return installationId

  const newInstallationId = uuid.v4()
  await storage.setItem('appSettings/installationId', newInstallationId, () => newInstallationId) // LEGACY: installationId is not serialized

  // new installation set the storage version to the current version
  // migrations happend before this, so when reading if empty returns current version
  await storageVersionMaker(storage).newInstallation()
}

export const initApp = async (storage: App.Storage) => {
  await initInstallationId(storage)
  await walletManager.removeDeletedWallets()
}
