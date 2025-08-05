import {isKeyOf} from '@yoroi/common'
import {ThemedPalette, atoms as a, useTheme} from '@yoroi/theme'

import {MaterialTopTabNavigationOptions} from '@react-navigation/material-top-tabs'
import {NavigationState} from '@react-navigation/native'
import {
  StackNavigationOptions,
  TransitionPresets,
} from '@react-navigation/stack'
import {
  Dimensions,
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'

import {compareArrays} from '~/wallets/utils/utils'
import {Icon} from '~/ui/Icon'

import {
  AppRoutes,
  TxHistoryRoutes,
  WalletStackRoutes,
  WalletTabRoutes,
} from '../types'

export const defaultStackNavigationOptions = (
  atoms: typeof a,
  color: ThemedPalette,
): StackNavigationOptions => {
  const width = Dimensions.get('window').width
  return {
    ...(Platform.OS === 'android' && {...TransitionPresets.SlideFromRightIOS}),
    detachPreviousScreen:
      false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
    cardStyle: {
      backgroundColor: color.bg_color_max,
    },
    cardOverlay: () => (
      <View
        style={{
          flex: 1,
          backgroundColor: color.bg_color_max,
        }}
      />
    ),
    headerTintColor: color.gray_max,
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
      backgroundColor: color.bg_color_max,
    },
    headerTitleStyle: {
      ...atoms.body_1_lg_medium,
      width: width - 75,
      textAlign: 'center',
    },
    headerTitleAlign: 'center',
    headerTitleContainerStyle: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerLeftContainerStyle: {
      ...atoms.pl_sm,
    },
    headerRightContainerStyle: {
      ...atoms.pr_sm,
    },
    headerLeft: (props) => <BackButton {...props} />,
  }
}

// NAVIGATOR TOP TABS OPTIONS
export const defaultMaterialTopTabNavigationOptions = (
  atoms: typeof a,
  color: ThemedPalette,
): MaterialTopTabNavigationOptions => {
  return {
    tabBarStyle: {
      backgroundColor: color.bg_color_max,
      elevation: 0,
      shadowOpacity: 0,
      marginHorizontal: 16,
    },
    tabBarIndicatorStyle: {backgroundColor: color.primary_600, height: 2},
    tabBarLabelStyle: {
      textTransform: 'none',
      ...atoms.body_1_lg_medium,
    },
    tabBarActiveTintColor: color.primary_600,
    tabBarInactiveTintColor: color.gray_600,
  }
}

export const shouldShowTabBarForRoutes = (state: NavigationState) => {
  const routes = getFocusedRouteName(state)

  if (routes.length === 1) {
    const [route] = routes
    return Object.keys(routesWithTabBar).includes(route)
  }

  const [route, subRoute] = routes
  return (
    isKeyOf(route, routesWithTabBar) &&
    routesWithTabBar[route].includes(subRoute)
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
  const {palette} = useTheme()

  return (
    <TouchableOpacity {...props} testID="buttonBack2">
      <Icon.Chevron direction="left" color={props.color ?? palette.gray_max} />
    </TouchableOpacity>
  )
}
