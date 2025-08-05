import * as React from 'react'
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context'

import {useScreenCapture} from './src/features/ScreenCapture/useScreenCapture'
import {
  MetricsProvider,
  makeMetricsManager,
} from './src/kernel/metrics/metricsManager'
import {RouterContainer} from './src/kernel/navigation/RouterContainer'
import {ModalProvider} from './src/ui/Modal/ModalContext'

const metricsManager = makeMetricsManager()

export function PlatformShell({children}: React.PropsWithChildren) {
  useScreenCapture()
  // TODO: Uncomment this when we have a way to test notifications
  // useInitNotifications({localEnabled: true, pushEnabled: true})

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <MetricsProvider metricsManager={metricsManager}>
        <RouterContainer>
          <ModalProvider>{children}</ModalProvider>
        </RouterContainer>
      </MetricsProvider>
    </SafeAreaProvider>
  )
}
