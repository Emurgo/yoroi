import React from 'react'
import {NavigationRouteContext} from '@react-navigation/native'

const route = {
  key: 'route.key',
  name: 'route.name',
}

export const RouteProvider: React.FC<React.PropsWithChildren<{params?: Record<string, unknown>}>> = ({
  children,
  params,
}) => (
  <NavigationRouteContext.Provider value={params ? {...route, params} : route}>
    {children}
  </NavigationRouteContext.Provider>
)
