import PostHog from 'posthog-react-native'
import * as React from 'react'
import {Platform} from 'react-native'
import {KeyboardProvider} from 'react-native-keyboard-controller'
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context'

import {AnalyticsRootProvider} from '~/features/Analytics/context/AnalyticsRootProvider'
import {routeToEvent} from '~/features/Analytics/events/route-events'
import {createPosthogClient} from '~/features/Analytics/helpers/createPosthogClient'
import {useAnalyticsTracking} from '~/features/Analytics/hooks/useAnalyticsTracking'
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
        metricsEnabledStorage={metricsEnabledStorageKeyManager}
      >
        <TrackedRouterContainer>
          <ModalProvider>
            <BackgroundTimerProvider active={isAndroid}>
              <KeyboardProvider statusBarTranslucent>
                {children}
              </KeyboardProvider>
            </BackgroundTimerProvider>
          </ModalProvider>
        </TrackedRouterContainer>
      </AnalyticsRootProvider>
    </SafeAreaProvider>
  )
}

function usePosthogClient(enabled: boolean) {
  const installationId = React.useMemo(() => initInstallationId(), [])

  const client = React.useMemo(() => {
    const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY
    const host = process.env.EXPO_PUBLIC_POSTHOG_HOST
    if (!apiKey || !host) throw new Error('Analytics client is not configured')
    const sdk = new PostHog(apiKey, {host, disabled: !enabled})
    return createPosthogClient({sdk})
  }, [enabled])

  React.useEffect(() => {
    if (installationId && enabled) client.identify(installationId)
  }, [client, installationId, enabled])

  return client
}

function TrackedRouterContainer({children}: React.PropsWithChildren) {
  const {trackEvent} = useAnalyticsTracking()
  const [currentRoute, setCurrentRoute] = React.useState<string | undefined>()

  const handleRouteChange = React.useCallback((routeName?: string) => {
    setCurrentRoute(routeName)
  }, [])

  const debouncedTrack = React.useCallback(() => {
    if (!currentRoute) return
    const mapped = routeToEvent[currentRoute]
    if (!mapped) return
    if (typeof mapped === 'string') trackEvent(mapped)
    else trackEvent(mapped.event, mapped.properties)
  }, [currentRoute, trackEvent])

  React.useEffect(() => {
    const timer = setTimeout(debouncedTrack, 100)
    return () => clearTimeout(timer)
  }, [debouncedTrack])

  return (
    <RouterContainer onRouteChange={handleRouteChange}>
      {children}
    </RouterContainer>
  )
}
