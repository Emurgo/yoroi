import {createStackNavigator} from '@react-navigation/stack'
import {DappConnectorProvider} from '@yoroi/dapp-connector'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {LoadingBoundary} from '../../components'
import {SomethingWentWrong} from '../../components/SomethingWentWrong/SomethingWentWrong'
import {defaultStackNavigationOptions, DiscoverRoutes} from '../../kernel/navigation'
import {BrowserNavigator} from './BrowserNavigator'
import {useStrings} from './common/useStrings'
import {ListSkeleton} from './useCases/SelectDappFromList/ListSkeleton'
import {SelectDappFromListScreen} from './useCases/SelectDappFromList/SelectDappFromListScreen'
import {useDappConnectorManager} from './useDappConnectorManager'
import {ReviewTransaction} from './ReviewTransaction/ReviewTransaction'

const Stack = createStackNavigator<DiscoverRoutes>()

export const DiscoverNavigator = () => {
  const {atoms, color} = useTheme()
  const strings = useStrings()

  const manager = useDappConnectorManager()

  return (
    <DappConnectorProvider manager={manager}>
      <Stack.Navigator
        screenOptions={{
          ...defaultStackNavigationOptions(atoms, color),
          headerLeft: () => null,
          gestureEnabled: true,
        }}
        initialRouteName="discover-select-dapp-from-list"
      >
        <Stack.Screen name="discover-select-dapp-from-list" options={{title: strings.discoverTitle}}>
          {() => (
            <ErrorBoundary FallbackComponent={SomethingWentWrong}>
              <LoadingBoundary fallback={<ListSkeleton />}>
                <SelectDappFromListScreen />
              </LoadingBoundary>
            </ErrorBoundary>
          )}
        </Stack.Screen>

        <Stack.Screen name="discover-browser" component={BrowserNavigator} options={{headerShown: false}} />

        <Stack.Screen
          name="discover-review-tx"
          component={ReviewTransaction}
          options={{...defaultStackNavigationOptions(atoms, color), title: strings.transactionReview}}
        />
      </Stack.Navigator>
    </DappConnectorProvider>
  )
}
