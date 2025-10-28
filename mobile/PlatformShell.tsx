import PostHog from 'posthog-react-native'
import * as React from 'react'
import {Platform} from 'react-native'
import {KeyboardProvider} from 'react-native-keyboard-controller'
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context'

import {AnalyticsRootProvider} from '~/features/Analytics/context/AnalyticsRootProvider'
import {createPosthogClient} from '~/features/Analytics/helpers/createPosthogClient'
import {useScreenCapture} from '~/features/Settings/hooks/useScreenCapture'
import {RouterContainer} from '~/kernel/navigation/RouterContainer'
import {
  initInstallationId,
  metricsEnabledStorageKeyManager,
} from '~/kernel/storage/storages'
import {ModalProvider} from '~/ui/Modal/context/ModalContext'

import {BackgroundTimerProvider} from './src/hooks/BackgroundTimerContext'

export function PlatformShell({children}: React.PropsWithChildren) {
  const metricsEnabled = metricsEnabledStorageKeyManager.read()

  const {init} = useScreenCapture()
  // Only enable on Android where permission dialogs trigger auto-logout
  const isAndroid = Platform.OS === 'android'
  const platform = isAndroid ? 'Android' : 'IOS'
  const client = usePosthogClient(metricsEnabled)

  React.useEffect(() => {
    init()
  })

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AnalyticsRootProvider
        initialEnabled={metricsEnabled}
        platform={platform}
        client={client}
      >
        <RouterContainer>
          <ModalProvider>
            <BackgroundTimerProvider active={isAndroid}>
              <KeyboardProvider statusBarTranslucent>
                {children}
              </KeyboardProvider>
            </BackgroundTimerProvider>
          </ModalProvider>
        </RouterContainer>
      </AnalyticsRootProvider>
    </SafeAreaProvider>
  )
}

function usePosthogClient(enabled: boolean) {
  const installationId = React.useMemo(() => initInstallationId(), [])

  const client = React.useMemo(() => {
    const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY
    const host = process.env.EXPO_PUBLIC_POSTHOG_HOST
    if (!apiKey || !host) return null
    const sdk = new PostHog(apiKey, {host, disabled: false})
    return createPosthogClient({sdk})
  }, [])

  React.useEffect(() => {
    if (client && installationId && enabled) client.identify(installationId)
  }, [client, installationId, enabled])

  return client
}
