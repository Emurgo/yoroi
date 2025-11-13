import * as React from 'react'
import {SafeAreaProvider} from 'react-native-safe-area-context'

import {RouterContainer} from './src/kernel/navigation/RouterContainer'

export function PlatformShell({children}: React.PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <RouterContainer>{children}</RouterContainer>
    </SafeAreaProvider>
  )
}
