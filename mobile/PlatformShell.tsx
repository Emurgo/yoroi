import PostHog from 'posthog-react-native'
import * as React from 'react'
import {Platform} from 'react-native'
import {KeyboardProvider} from 'react-native-keyboard-controller'
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context'

import {PosthogClient} from '~/features/Analytics/adapters/PosthogClient'
import {
  AnalyticsRootProvider,
  useAnalyticsContext,
} from '~/features/Analytics/context/AnalyticsRootProvider'
import {useScreenCapture} from '~/features/Settings/hooks/useScreenCapture'
import {RouterContainer} from '~/kernel/navigation/RouterContainer'
import {
  initInstallationId,
  metricsEnabledStorageKeyManager,
} from '~/kernel/storage/storages'
import {ModalProvider} from '~/ui/Modal/context/ModalContext'

import {BackgroundTimerProvider} from './src/hooks/BackgroundTimerContext'

function AnalyticsInitializer({children}: React.PropsWithChildren) {
  const installationId = React.useMemo(() => initInstallationId(), [])
  const {setClient, enabled} = useAnalyticsContext()

  React.useEffect(() => {
    const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY
    const host = process.env.EXPO_PUBLIC_POSTHOG_HOST
    if (!apiKey || !host) {
      setClient(null)
      return
    }
    const platform = Platform.OS === 'ios' ? 'IOS' : 'Android'
    const sdk = new PostHog(apiKey, {host, disabled: !enabled})
    const client = new PosthogClient({client: sdk, platform})
    if (installationId) client.identify(installationId)
    setClient(client)
    return () => setClient(null)
  }, [enabled, installationId, setClient])
  return <>{children}</>
}

export function PlatformShell({children}: React.PropsWithChildren) {
  const metricsEnabled = metricsEnabledStorageKeyManager.read()

  const {init} = useScreenCapture()
  // Only enable on Android where permission dialogs trigger auto-logout
  const isAndroid = Platform.OS === 'android'

  React.useEffect(() => {
    init()
  })

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AnalyticsRootProvider initialEnabled={metricsEnabled}>
        <AnalyticsInitializer>
          <RouterContainer>
            <ModalProvider>
              <BackgroundTimerProvider active={isAndroid}>
                <KeyboardProvider statusBarTranslucent>
                  {children}
                </KeyboardProvider>
              </BackgroundTimerProvider>
            </ModalProvider>
          </RouterContainer>
        </AnalyticsInitializer>
      </AnalyticsRootProvider>
    </SafeAreaProvider>
  )
}
