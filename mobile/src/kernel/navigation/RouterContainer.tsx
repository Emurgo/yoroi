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
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const paletteRef = React.useRef(palette)
  const isDarkRef = React.useRef(isDark)

  // Keep refs in sync with theme values
  React.useEffect(() => {
    paletteRef.current = palette
    isDarkRef.current = isDark
  }, [palette, isDark])

  const handleStateChange = React.useCallback(
    (_state: NavigationState | undefined) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Debounce status bar updates to prevent rapid-fire updates
      debounceTimerRef.current = setTimeout(() => {
        const routeName = navRef.current?.getCurrentRoute()?.name
        // Use refs to avoid dependency on palette/isDark in callback
        applyStatusBarForRoute(routeName, paletteRef.current, isDarkRef.current)
        if (onRouteChange) onRouteChange(routeName)
      }, 100)
    },
    [onRouteChange],
  )

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

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
