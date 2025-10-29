import {supportedPrefixes} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'

import {
  NavigationContainer,
  NavigationContainerRef,
  NavigationState,
} from '@react-navigation/native'
import * as React from 'react'

import {applyStatusBarForRoute} from './common/helpers'

const prefixes = [...supportedPrefixes]
const navRef =
  React.createRef<NavigationContainerRef<ReactNavigation.RootParamList>>()

type Props = React.PropsWithChildren<{
  onRouteChange?: (routeName: string | undefined) => void
}>

export function RouterContainer({children, onRouteChange}: Props) {
  const {palette, isDark} = useTheme()

  const handleStateChange = React.useCallback(
    (_state: NavigationState | undefined) => {
      const routeName = navRef.current?.getCurrentRoute()?.name
      applyStatusBarForRoute(routeName, palette, isDark)
      if (onRouteChange) onRouteChange(routeName)
    },
    [onRouteChange, palette, isDark],
  )

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
