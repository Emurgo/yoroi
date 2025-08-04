import {DappConnectorProvider} from '@yoroi/dapp-connector'
import {atoms as a, useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {useStrings} from '~/kernel/i18n/useStrings'
import {
  DiscoverRoutes,
  defaultStackNavigationOptions,
} from '~/kernel/navigation/navigation'
import {LoadingBoundary} from '~/ui/Boundary/Boundary'
import {FullErrorFallback} from '~/ui/Boundary/FullErrorFallback'

import {NetworkTag} from '../Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {BrowserNavigator} from './BrowserNavigator'
import {ListSkeleton} from './useCases/SelectDappFromList/ListSkeleton'
import {SelectDappFromListScreen} from './useCases/SelectDappFromList/SelectDappFromListScreen'
import {useDappConnectorManager} from './useDappConnectorManager'

const Stack = createStackNavigator<DiscoverRoutes>()

export const DiscoverNavigator = () => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()

  const manager = useDappConnectorManager()

  return (
    <DappConnectorProvider manager={manager}>
      <Stack.Navigator
        screenOptions={{
          ...defaultStackNavigationOptions(a, p),
          headerLeft: () => null,
          gestureEnabled: true,
          headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
        }}
        initialRouteName="discover-select-dapp-from-list"
      >
        <Stack.Screen
          name="discover-select-dapp-from-list"
          options={{title: strings.discover.discoverTitle}}
        >
          {() => (
            <ErrorBoundary FallbackComponent={FullErrorFallback}>
              <LoadingBoundary fallback={<ListSkeleton />}>
                <SelectDappFromListScreen />
              </LoadingBoundary>
            </ErrorBoundary>
          )}
        </Stack.Screen>

        <Stack.Screen
          name="discover-browser"
          component={BrowserNavigator}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </DappConnectorProvider>
  )
}
