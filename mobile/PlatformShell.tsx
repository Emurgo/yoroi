import * as React from 'react'
import {KeyboardProvider} from 'react-native-keyboard-controller'
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
import {ModalProvider} from '~/ui/Modal/context/ModalContext'

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
          <ModalProvider>
            <KeyboardProvider statusBarTranslucent>{children}</KeyboardProvider>
          </ModalProvider>
        </RouterContainer>
      </MetricsProvider>
    </SafeAreaProvider>
  )
}
