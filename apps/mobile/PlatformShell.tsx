import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context'

import {RouterContainer} from './src/kernel/navigation/Router'

export function PlatformShell({children}: React.PropsWithChildren) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <RouterContainer>{children}</RouterContainer>
    </SafeAreaProvider>
  )
}
