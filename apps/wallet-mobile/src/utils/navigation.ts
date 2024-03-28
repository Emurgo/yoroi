import {NavigationProp, NavigationState, useNavigation, useNavigationState} from '@react-navigation/native'
import {useEffect, useState} from 'react'
import {InteractionManager} from 'react-native'

import {compareArrays} from '../yoroi-wallets/utils'

function useKeepRoutesInHistory(routesToKeep: string[]) {
  const navigation = useNavigation()
  const [initialRouteId] = useState(() => getNavigationRouteId(navigation))

  useEffect(() => {
    const currentRouteId = getNavigationRouteId(navigation)

    if (currentRouteId !== initialRouteId) {
      return
    }
    const {routes} = navigation.getState()
    const currentRouteNames = routes.map((r) => r.name)

    if (compareArrays(currentRouteNames, routesToKeep)) {
      return
    }

    const newRoutes = routes.filter((r) => routesToKeep.includes(r.name))

    const task = InteractionManager.runAfterInteractions(() => {
      const newState = {
        index: newRoutes.length - 1,
        routes: newRoutes.map((r) => ({...r, state: undefined})),
        routeNames: newRoutes.map((r) => r.name),
      }
      navigation.reset(newState)
    })

    return () => task.cancel()
  }, [navigation, initialRouteId, routesToKeep])
}

export const useIsRouteActive = () => {
  const navigation = useNavigation()
  const currentRouteName = useNavigationState((s) => selectRouteName(s))
  const [initialRouteName] = useState(() => selectRouteName(navigation.getState()))
  return initialRouteName === currentRouteName
}

export function useOverridePreviousRoute<RouteName extends string>(previousRouteName: RouteName) {
  const navigation = useNavigation()
  const [initialRouteName] = useState(() => getNavigationRouteName(navigation))
  const allRouteNames: string[] = navigation.getState().routes.map((route) => route.name)
  const previousRouteIndex = allRouteNames.indexOf(previousRouteName)
  const currentRouteIndex = allRouteNames.indexOf(initialRouteName)

  let newRoutes = allRouteNames
  if (previousRouteIndex < currentRouteIndex) {
    newRoutes = allRouteNames.filter((routeName, index) => index <= previousRouteIndex || index >= currentRouteIndex)
  }

  if (previousRouteIndex > currentRouteIndex) {
    newRoutes = allRouteNames.filter((routeName, index) => index < currentRouteIndex)
    newRoutes.push(previousRouteName, initialRouteName)
  }

  useKeepRoutesInHistory(newRoutes)
}

function getNavigationRouteId(navigation: NavigationProp<ReactNavigation.RootParamList>) {
  const state = navigation.getState()
  return state.routes[state.index].key
}

function getNavigationRouteName(navigation: NavigationProp<ReactNavigation.RootParamList>) {
  return selectRouteName(navigation.getState())
}

const selectRouteName = (state: NavigationState) => state.routes[state.index].name
