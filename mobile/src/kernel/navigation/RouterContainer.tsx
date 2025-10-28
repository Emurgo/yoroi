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

type Props = React.PropsWithChildren<{
  onRouteChange?: (routeName: string | undefined) => void
}>

export function RouterContainer({children, onRouteChange}: Props) {
  const [currentRouteName, setCurrentRouteName] = React.useState<
    string | undefined
  >(undefined)

  const handleStateChange = React.useCallback(
    (state: NavigationState | undefined) => {
      if (state) {
        const routeName = getCurrentRouteName(state)
        setCurrentRouteName(routeName)
        if (onRouteChange) onRouteChange(routeName)
      }
    },
    [onRouteChange],
  )

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
