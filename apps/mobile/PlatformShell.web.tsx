import * as React from 'react'
import {SafeAreaProvider} from 'react-native-safe-area-context'

import {
  MetricsProvider,
  makeMetricsManager,
} from './src/kernel/metrics/metricsManager'
import {RouterContainer} from './src/kernel/navigation/RouterContainer'

const metricsManager = makeMetricsManager()

export function PlatformShell({children}: React.PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <MetricsProvider metricsManager={metricsManager}>
        <RouterContainer>{children}</RouterContainer>
      </MetricsProvider>
    </SafeAreaProvider>
  )
}
