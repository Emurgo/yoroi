import * as React from 'react'
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context'

import {useScreenCapture} from '~/features/Settings/hooks/useScreenCapture'
import {
  MetricsProvider,
  makeMetricsManager,
} from '~/kernel/metrics/metricsManager'
import {RouterContainer} from '~/kernel/navigation/RouterContainer'
import {ModalProvider} from '~/ui/Modal/ModalContext'

export function PlatformShell({children}: React.PropsWithChildren) {
  const metricsManager = React.useMemo(() => makeMetricsManager(), [])
  const {init} = useScreenCapture()

  React.useEffect(() => {
    init()
  })

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
