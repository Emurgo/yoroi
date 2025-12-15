import PostHog from 'posthog-react-native'
import * as React from 'react'
import {Platform} from 'react-native'
import {KeyboardProvider} from 'react-native-keyboard-controller'
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context'

import {BackgroundTimerProvider} from '~/common/providers/BackgroundTimerContext'
import {AnalyticsRootProvider} from '~/features/Analytics/context/AnalyticsRootProvider'
import {routeToEvent} from '~/features/Analytics/events/route-events'
import {createPosthogClient} from '~/features/Analytics/helpers/createPosthogClient'
import {useAnalyticsTracking} from '~/features/Analytics/hooks/useAnalyticsTracking'
import {RouterContainer} from '~/kernel/navigation/RouterContainer'
import {
  initInstallationId,
  metricsEnabledStorageKeyManager,
} from '~/kernel/storage/storages'
import {ModalProvider} from '~/ui/Modal/context/ModalContext'

export function PlatformShell({children}: React.PropsWithChildren) {
  const [metricsEnabled, setMetricsEnabled] = React.useState<boolean>(
    metricsEnabledStorageKeyManager.read(),
  )

  const isAndroid = Platform.OS === 'android'
  const platform = isAndroid ? 'Android' : 'IOS'
  const client = usePosthogClient(metricsEnabled)

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AnalyticsRootProvider
        initialEnabled={metricsEnabled}
        platform={platform}
        client={client}
        metricsEnabledStorage={metricsEnabledStorageKeyManager}
        onEnabledChange={setMetricsEnabled}
      >
        <TrackedRouterContainer>
          <ModalProvider>
            <BackgroundTimerProvider active={isAndroid}>
              <KeyboardProvider>{children}</KeyboardProvider>
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
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleRouteChange = React.useCallback(
    (routeName?: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (!routeName) return

      timeoutRef.current = setTimeout(() => {
        const mapped = routeToEvent[routeName]
        if (!mapped) return
        if (typeof mapped === 'string') trackEvent(mapped)
        else trackEvent(mapped.event, mapped.properties)
      }, 100)
    },
    [trackEvent],
  )

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <RouterContainer onRouteChange={handleRouteChange}>
      {children}
    </RouterContainer>
  )
}
