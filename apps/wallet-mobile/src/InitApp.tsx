import React, {useEffect, useRef} from 'react'
import {Platform, UIManager} from 'react-native'
import {enableScreens} from 'react-native-screens'
import uuid from 'uuid'

import {AppNavigator} from './AppNavigator'
import {useStorage, YoroiStorage} from './yoroi-wallets/storage'
import {walletManager} from './yoroi-wallets/walletManager'
import * as Sentry from '@sentry/react-native'
import {CONFIG} from './legacy/config'
import {useCrashReportsEnabled} from './yoroi-wallets/hooks'
import {isString} from './yoroi-wallets/utils'

enableScreens()

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental != null) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

export const InitApp = () => {
  const loaded = useInitApp()
  if (!loaded) return null

  return <A />
}

const A = Sentry.wrap(() => <AppNavigator />)

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
    if (!CONFIG.SENTRY.ENABLE || !isString(CONFIG.SENTRY.DSN)) return
    console.log('init sentry')
    Sentry.init({
      dsn: CONFIG.SENTRY.DSN,
      patchGlobalPromise: true,
      tracesSampleRate: 1.0,
      beforeSend(event) {
        // https://github.com/getsentry/sentry-javascript/issues/2039
        const isEnabled = ref.current
        console.log('Sentry: isEnabled', isEnabled, event)
        return null
        // return isEnabled ? event : null
      },
    })
  }, [])
}
