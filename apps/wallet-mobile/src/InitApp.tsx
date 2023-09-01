import React, {useEffect, useRef} from 'react'
import {Platform, UIManager} from 'react-native'
import {enableScreens} from 'react-native-screens'
import * as Sentry from 'sentry-expo'
import uuid from 'uuid'

import {AppNavigator} from './AppNavigator'
import {CONFIG, isProduction} from './legacy/config'
import {useCrashReportsEnabled} from './yoroi-wallets/hooks'
import {useStorage, YoroiStorage} from './yoroi-wallets/storage'
import {isString} from './yoroi-wallets/utils'
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
  const crashReportsEnabled = useCrashReportsEnabled()

  useInitSentry({enabled: crashReportsEnabled})

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

const useInitSentry = (options: {enabled: boolean}) => {
  const ref = useRef(options.enabled)
  ref.current = options.enabled

  useEffect(() => {
    if (!isString(CONFIG.SENTRY_DSN)) return
    Sentry.init({
      dsn: CONFIG.SENTRY_DSN,
      patchGlobalPromise: true,
      enableInExpoDevelopment: true,
      tracesSampleRate: isProduction() ? 0.25 : 1,
      beforeSend(event) {
        // https://github.com/getsentry/sentry-javascript/issues/2039
        const isEnabled = ref.current
        return isEnabled ? event : null
      },
    })
  }, [])
}
