import {NavigationProp, useNavigation} from '@react-navigation/native'
import {useCallback, useEffect, useState} from 'react'
import {BackHandler} from 'react-native'

export function useOverrideBackNavigate(goBack: () => boolean) {
  const navigation = useNavigation()
  const [initialRouteId] = useState(() => getNavigationRouteId(navigation))

  const handleGoBack = useCallback(() => {
    const currentRouteId = getNavigationRouteId(navigation)

    if (currentRouteId !== initialRouteId) {
      return false
    }

    return goBack()
  }, [navigation, initialRouteId, goBack])

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleGoBack)
    return () => subscription.remove()
  }, [handleGoBack])
}

function getNavigationRouteId(navigation: NavigationProp<ReactNavigation.RootParamList>) {
  const state = navigation.getState()
  return state.routes[state.index].key
}
