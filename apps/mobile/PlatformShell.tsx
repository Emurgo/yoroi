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
import {RouterContainer} from './src/kernel/navigation/Router'

const metricsManager = makeMetricsManager()

export function PlatformShell({children}: React.PropsWithChildren) {
  useScreenCapture()

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <MetricsProvider metricsManager={metricsManager}>
        <RouterContainer>{children}</RouterContainer>
      </MetricsProvider>
    </SafeAreaProvider>
  )
}
