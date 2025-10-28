import * as React from 'react'
import {Platform} from 'react-native'
import {KeyboardProvider} from 'react-native-keyboard-controller'
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context'

import {useScreenCapture} from '~/features/Settings/hooks/useScreenCapture'
import {RouterContainer} from '~/kernel/navigation/RouterContainer'
import {ModalProvider} from '~/ui/Modal/context/ModalContext'

import {BackgroundTimerProvider} from './src/hooks/BackgroundTimerContext'

export function PlatformShell({children}: React.PropsWithChildren) {
  const {init} = useScreenCapture()
  // Only enable on Android where permission dialogs trigger auto-logout
  const isAndroid = Platform.OS === 'android'

  React.useEffect(() => {
    init()
  })

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <RouterContainer>
        <ModalProvider>
          <BackgroundTimerProvider active={isAndroid}>
            <KeyboardProvider statusBarTranslucent>{children}</KeyboardProvider>
          </BackgroundTimerProvider>
        </ModalProvider>
      </RouterContainer>
    </SafeAreaProvider>
  )
}
