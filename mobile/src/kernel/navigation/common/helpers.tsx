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
import {compareArrays} from '~/wallets/utils/utils'

import {
  AppRoutes,
  TxHistoryRoutes,
  WalletStackRoutes,
  WalletTabRoutes,
} from '../types'

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
  type RoutePath =
    | keyof AppRoutes
    | keyof WalletStackRoutes
    | keyof WalletTabRoutes
    | keyof TxHistoryRoutes
  const fullRoutePath: RoutePath[] = [
    'manage-wallets',
    'main-wallet-routes',
    'history',
    'history-list',
  ]
  const pathToCompare = fullRoutePath.slice(0, routes.length)
  return routes.length > 1 && compareArrays(pathToCompare, routes)
}

export const BackButton = (props: TouchableOpacityProps & {color?: string}) => {
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity {...props} testID="buttonBack2">
      <Icon.Chevron direction="left" color={props.color ?? p.gray_max} />
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
