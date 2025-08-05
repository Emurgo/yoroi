import {supportedPrefixes} from '@yoroi/links'

import {
  NavigationContainer,
  NavigationContainerRef,
  NavigationState,
} from '@react-navigation/native'
import * as React from 'react'

import {getCurrentRouteName} from './common/helpers'
import {useStatusBar} from './hooks/useStatusBar'

const prefixes = [...supportedPrefixes]
const navRef =
  React.createRef<NavigationContainerRef<ReactNavigation.RootParamList>>()

export function RouterContainer({children}: React.PropsWithChildren) {
  const [currentRouteName, setCurrentRouteName] = React.useState<string | undefined>(undefined)

  const handleStateChange = React.useCallback((state: NavigationState | undefined) => {
    if (state) {
      const routeName = getCurrentRouteName(state)
      setCurrentRouteName(routeName)
    }
  }, [])

  useStatusBar(currentRouteName)

  return (
    <NavigationContainer 
      ref={navRef} 
      linking={{enabled: true, prefixes}}
      onStateChange={handleStateChange}
    >
      {children}
    </NavigationContainer>
  )
}
