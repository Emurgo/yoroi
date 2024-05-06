import {createStackNavigator} from '@react-navigation/stack'
import {useAsyncStorage} from '@yoroi/common'
import {DappConnectorProvider} from '@yoroi/dapp-connector'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {LoadingBoundary} from '../../components'
import {defaultStackNavigationOptions, DiscoverRoutes} from '../../navigation'
import {useSelectedWallet} from '../WalletManager/Context'
import {BrowserNavigator} from './BrowserNavigator'
import {BrowserProvider} from './common/BrowserProvider'
import {createDappConnector} from './common/helpers'
import {useStrings} from './common/useStrings'
import {ListSkeleton} from './useCases/SelectDappFromList/ListSkeleton'
import {SelectDappFromListScreen} from './useCases/SelectDappFromList/SelectDappFromListScreen'

const Stack = createStackNavigator<DiscoverRoutes>()

export const DiscoverNavigator = () => {
  const {atoms, color} = useTheme()
  const strings = useStrings()

  const appStorage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const manager = React.useMemo(() => createDappConnector(appStorage, wallet), [appStorage, wallet])

  return (
    <DappConnectorProvider manager={manager}>
      <BrowserProvider>
        <Stack.Navigator
          screenOptions={{
            ...defaultStackNavigationOptions(atoms, color),
            headerLeft: () => null,
            detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
            gestureEnabled: true,
          }}
          initialRouteName="discover-select-dapp-from-list"
        >
          <Stack.Screen name="discover-select-dapp-from-list" options={{title: strings.discoverTitle}}>
            {() => (
              <LoadingBoundary fallback={<ListSkeleton />}>
                <SelectDappFromListScreen />
              </LoadingBoundary>
            )}
          </Stack.Screen>

          <Stack.Screen name="discover-browser" component={BrowserNavigator} options={{headerShown: false}} />
        </Stack.Navigator>
      </BrowserProvider>
    </DappConnectorProvider>
  )
}
