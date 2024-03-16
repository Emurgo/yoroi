import {isString, useAsyncStorage} from '@yoroi/common'
import {App} from '@yoroi/types'
import React, {useEffect, useRef} from 'react'
import {Platform, UIManager} from 'react-native'
import uuid from 'uuid'

import {AppNavigator} from './AppNavigator'
import {useInitScreenShare} from './features/Settings/ScreenShare'
import {CONFIG, isProduction} from './legacy/config'
import {storageVersionMaker} from './migrations/storageVersion'
import {walletManager} from './wallet-manager/walletManager'
import {useCrashReportsEnabled} from './yoroi-wallets/hooks'

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
  const crashReportsEnabled = useCrashReportsEnabled()

  const {initialised: screenShareInitialized} = useInitScreenShare()

  useInitSentry({enabled: crashReportsEnabled})

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
  await storageVersionMaker(storage).newInstallation()
}

export const initApp = async (storage: App.Storage) => {
  await initInstallationId(storage)
  await walletManager.removeDeletedWallets()
}

const useInitSentry = (options: {enabled: boolean}) => {
  const ref = useRef(options.enabled)
  ref.current = options.enabled

  useEffect(() => {
    if (!isString(CONFIG.SENTRY_DSN)) return
    Sentry.init({
      dsn: CONFIG.SENTRY_DSN,
      patchGlobalPromise: true,
      tracesSampleRate: isProduction() ? 0.25 : 1,
      beforeSend(event) {
        // https://github.com/getsentry/sentry-javascript/issues/2039
        const isEnabled = ref.current
        return isEnabled ? event : null
      },
    })
  }, [])
}
