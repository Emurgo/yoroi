import {isKeyOf} from '@yoroi/common'
import {ThemedPalette, atoms as a, useTheme} from '@yoroi/theme'

import {MaterialTopTabNavigationOptions} from '@react-navigation/material-top-tabs'
import {NavigationState} from '@react-navigation/native'
import {
  StackNavigationOptions,
  TransitionPresets,
} from '@react-navigation/stack'
import {setBackgroundColorAsync} from 'expo-system-ui'
import * as React from 'react'
import {
  Dimensions,
  Platform,
  StatusBar,
  StatusBarStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'

import {Icon} from '~/ui/Icon'

import {AppRoutes, WalletStackRoutes, WalletTabRoutes} from '../types'

export const defaultStackNavigationOptions = (
  palette: ThemedPalette,
): StackNavigationOptions => {
  const width = Dimensions.get('window').width
  return {
    ...(Platform.OS === 'android' && {...TransitionPresets.SlideFromRightIOS}),
    detachPreviousScreen:
      false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
    cardStyle: {
      backgroundColor: palette.bg_color_max,
    },
    cardOverlay: () => (
      <View
        style={{
          ...a.flex_1,
          backgroundColor: palette.bg_color_max,
        }}
      />
    ),
    headerTintColor: palette.gray_max,
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
      backgroundColor: palette.bg_color_max,
    },
    headerTitleStyle: {
      ...a.body_1_lg_medium,
      ...a.text_center,
      width: width - 75,
    },
    headerTitleAlign: 'center',
    headerTitleContainerStyle: {
      ...a.flex_1,
      ...a.align_center,
      ...a.justify_center,
    },
    headerLeftContainerStyle: {
      ...a.pl_sm,
    },
    headerRightContainerStyle: {
      ...a.pr_sm,
    },
    headerLeft: (props) => <BackButton {...props} />,
  }
}

// NAVIGATOR TOP TABS OPTIONS
export const defaultMaterialTopTabNavigationOptions = (
  color: ThemedPalette,
): MaterialTopTabNavigationOptions => {
  return {
    tabBarStyle: {
      backgroundColor: color.bg_color_max,
      elevation: 0,
      shadowOpacity: 0,
      ...a.pt_md,
      ...a.pb_md,
    },
    tabBarIndicatorStyle: {backgroundColor: color.primary_600, height: 2},
    tabBarLabelStyle: {
      textTransform: 'none',
      ...a.body_1_lg_medium,
    },
    tabBarActiveTintColor: color.primary_600,
    tabBarInactiveTintColor: color.gray_600,
  }
}

export const shouldShowTabBarForRoutes = (state: NavigationState) => {
  const routes = getFocusedRouteName(state)

  if (routes.length === 1) {
    const [route] = routes
    return Object.keys(routesWithTabBar).includes(route ?? '')
  }

  const [route, subRoute] = routes
  return (
    isKeyOf(route, routesWithTabBar) &&
    routesWithTabBar[route ?? ''].includes(subRoute ?? '')
  )
}

const routesWithTabBar: Record<keyof WalletTabRoutes, string[]> = {
  history: ['history-list'],
  portfolio: ['dashboard-portfolio'],
  discover: ['discover-select-dapp-from-list'],
  menu: ['_menu'],
}

const getFocusedRouteName = (
  state: Partial<NavigationState> | NavigationState['routes'][0]['state'],
): string[] => {
  const currentRoute = state?.routes?.[state?.index ?? -1]
  const currentState = currentRoute?.state
  const name = currentRoute?.name ?? null
  if (name === null) return []

  if (currentState) {
    return [name, ...getFocusedRouteName(currentState)]
  }

  return [name]
}

export const isWalletSelectionRoute = (
  state: Partial<NavigationState> | NavigationState['routes'][0]['state'],
) => {
  const routes = getFocusedRouteName(state)
  const manageWalletsRoute: keyof AppRoutes = 'manage-wallets'
  const walletSelectionRoute: keyof WalletStackRoutes = 'wallet-selection'

  return (
    (routes.length === 1 && routes[0] === manageWalletsRoute) ||
    (routes.length === 2 && routes[1] === walletSelectionRoute)
  )
}

export const isTxHistoryRoute = (
  state: Partial<NavigationState> | NavigationState['routes'][0]['state'],
) => {
  const routes = getFocusedRouteName(state)
  const focusedRoute = routes[routes.length - 1]
  return focusedRoute === 'history-list'
}

export const isAuthRoute = (
  state: Partial<NavigationState> | NavigationState['routes'][0]['state'],
) => {
  const routes = getFocusedRouteName(state)
  const authRoutes: (keyof AppRoutes)[] = [
    'first-run',
    'agreement-changed-notice',
    'custom-pin-auth',
    'bio-auth-initial',
    'enable-login-with-pin',
  ]

  return routes.some((route) => authRoutes.includes(route as keyof AppRoutes))
}

export const BackButton = (props: TouchableOpacityProps & {color?: string}) => {
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity {...props} testID="buttonBack2">
      <Icon.Chevron
        direction="left"
        size={24}
        color={props.color ?? p.gray_max}
      />
    </TouchableOpacity>
  )
}

type StatusBarColor = {
  bgColorAndroid: Color
  statusBarStyle: StatusBarStyle | undefined
}

export const applyStatusBarForRoute = (
  currentRouteName: string | undefined,
  color: ThemedPalette,
  isDark?: boolean,
) => {
  if (currentRouteName === 'modal') {
    if (Platform.OS === 'android')
      StatusBar.setBackgroundColor(
        simulateOpacity(
          getStatusBarStyleByRoute({currentRouteName, isDark, color})
            .bgColorAndroid,
        ),
        true,
      )
  } else {
    const style = getStatusBarStyleByRoute({
      currentRouteName,
      isDark,
      color,
    })
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(style.bgColorAndroid)
      StatusBar.setTranslucent(true)
    }
    style.statusBarStyle !== undefined &&
      StatusBar.setBarStyle(style.statusBarStyle, true)
  }

  setBackgroundColorAsync(color.bg_color_max)
}

const getStatusBarStyleByRoute = ({
  currentRouteName,
  isDark,
  color,
}: {
  currentRouteName: string | undefined
  isDark?: boolean
  color: ThemedPalette
}): StatusBarColor => {
  if (currentRouteName) {
    if (currentRouteName === 'history-list') {
      return {
        bgColorAndroid: 'rgba(0,0,0,0)',
        statusBarStyle: undefined,
      }
    } else if (oldBlueRoutes.includes(currentRouteName)) {
      return {
        bgColorAndroid: '#254BC9',
        statusBarStyle: 'light-content',
      }
    } else if (currentRouteName === 'scan-start') {
      return {
        bgColorAndroid: color.black_static,
        statusBarStyle: 'dark-content',
      }
    }
  }
  return {
    bgColorAndroid: isDark ? color.bg_color_max : color.white_static,
    statusBarStyle: isDark ? 'light-content' : 'dark-content',
  }
}

const oldBlueRoutes = ['enable-login-with-os', 'auth-with-os']

export const simulateOpacity = (color: Color): Color => {
  if (!isHex(color)) {
    return color
  }
  const expandedColor = expandColor(color)
  const alphaChannel = expandedColor.substring(7, 9).toLowerCase()

  const opaquedColor = [...expandedColor.substring(1, 7)]
    .reduce(toRgb, [] as string[])
    .map(halveIntensity)
    .join('')
    .toLowerCase()

  return `#${opaquedColor}${alphaChannel}`
}

const halveIntensity = (hex: string) => {
  return Math.floor(parseInt(hex, 16) / 2)
    .toString(16)
    .padStart(2, '0')
}

const toRgb = (fullHexColor: string[], value: string, index: number) => {
  if (index % 2 === 0) fullHexColor.push(value)
  else fullHexColor[fullHexColor.length - 1] += value
  return fullHexColor
}

const expandColor = (color: Color) => {
  if ((color.length === 4 || color.length === 5) && isHex(color)) {
    return '#'.concat(
      color
        .substring(1)
        .split('')
        .map((char) => char + char)
        .join(''),
    )
  }
  return color
}

const isHex = (color: Color) =>
  /^#([0-9A-Fa-f]{3}([0-9A-Fa-f]{1})?|[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?)$/.test(
    color,
  )

type Color = `#${string}` | `rgba(${number},${number},${number},${number})`

/**
 * Removes a specific route from the navigation state without animation
 * Supports traversing parent navigators to find the route at the correct level
 * @param navigation - The navigation object (must have getState, reset, and getParent methods)
 * @param routeName - The name of the route to remove
 * @param options - Optional configuration
 */
export type NavigationLike = {
  getState: () => NavigationState | undefined
  reset: (state: NavigationState) => void
  getParent?: () => NavigationLike | undefined
  dispatch?: (action: {type: string; payload?: unknown}) => void
}

export const removeRouteFromNavigationState = (
  navigation: NavigationLike,
  routeName: string,
  options?: {
    /**
     * Maximum depth to traverse up the navigator hierarchy (default: 3)
     */
    maxDepth?: number
    /**
     * Whether to traverse parent navigators to find the route (default: true)
     */
    traverseParents?: boolean
  },
): void => {
  const maxDepth = options?.maxDepth ?? 3
  const traverseParents = options?.traverseParents ?? true

  // Try to find the route in the current navigator or parent navigators
  let targetNavigation: NavigationLike = navigation
  let currentDepth = 0
  let foundRoute = false

  while (currentDepth < maxDepth && traverseParents) {
    const state = targetNavigation.getState()
    if (!state) {
      break
    }

    const hasRoute = state.routes.some((route) => route.name === routeName)
    if (hasRoute) {
      foundRoute = true
      break
    }

    // Try parent navigator
    if (targetNavigation.getParent) {
      const parent = targetNavigation.getParent()
      if (parent) {
        targetNavigation = parent
        currentDepth++
      } else {
        break
      }
    } else {
      break
    }
  }

  if (!foundRoute && traverseParents) {
    return
  }

  const state = targetNavigation.getState()
  if (!state) {
    return
  }

  // Filter out ALL routes with the specified name (handles duplicates)
  const filteredRoutes = state.routes.filter(
    (route) => route.name !== routeName,
  )

  // Bug fix 1: Handle empty routes case
  if (filteredRoutes.length === 0) {
    // Don't allow removing all routes - this would break navigation state
    return
  }

  // Only reset if we actually removed a route
  if (filteredRoutes.length < state.routes.length) {
    // Bug fix 3: Count ALL removed routes before current index (handles duplicates)
    const currentIndex = state.index ?? 0
    let removedCountBeforeCurrent = 0

    for (let i = 0; i < currentIndex; i++) {
      if (state.routes[i]?.name === routeName) {
        removedCountBeforeCurrent++
      }
    }

    // Calculate the new index based on how many routes were removed before current
    let newIndex: number
    if (removedCountBeforeCurrent > 0) {
      // Routes were removed before current index, adjust index
      newIndex = Math.max(0, currentIndex - removedCountBeforeCurrent)
    } else {
      // No routes removed before current index, keep index the same
      newIndex = currentIndex
    }

    // Ensure the new index is valid for the filtered routes
    // Bug fix 1: This is now safe because we return early if filteredRoutes.length === 0
    newIndex = Math.min(filteredRoutes.length - 1, Math.max(0, newIndex))

    // Use reset method to update navigation state
    targetNavigation.reset({
      ...state,
      index: newIndex,
      routes: filteredRoutes,
    })
  }
}
