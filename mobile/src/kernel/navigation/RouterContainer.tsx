import {useDebouncedCallback} from '@yoroi/common'
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
  const paletteRef = React.useRef(palette)
  const isDarkRef = React.useRef(isDark)

  // Keep refs in sync with theme values
  React.useEffect(() => {
    paletteRef.current = palette
    isDarkRef.current = isDark
  }, [palette, isDark])

  // Use state to trigger re-renders for debounced callback
  const [stateChangeCount, setStateChangeCount] = React.useState(0)

  const handleStateChangeDebounced = React.useCallback(() => {
    const routeName = navRef.current?.getCurrentRoute()?.name
    // Use refs to avoid dependency on palette/isDark in callback
    applyStatusBarForRoute(routeName, paletteRef.current, isDarkRef.current)
    if (onRouteChange) onRouteChange(routeName)
  }, [onRouteChange])

  const handleStateChange = React.useCallback(
    (_state: NavigationState | undefined) => {
      // Increment state to trigger re-render and debounced callback
      setStateChangeCount((prev) => prev + 1)
    },
    [],
  )

  useDebouncedCallback(
    handleStateChangeDebounced,
    stateChangeCount,
    100,
    false, // Don't skip first render - we want initial route to be processed
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
