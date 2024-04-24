import {createStackNavigator} from '@react-navigation/stack'
import {useAsyncStorage} from '@yoroi/common'
import {connectionStorageMaker, dappConnectorMaker, DappConnectorProvider} from '@yoroi/dapp-connector'
import {useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'
import * as React from 'react'
import {Alert} from 'react-native'

import {LoadingBoundary} from '../../components'
import {defaultStackNavigationOptions, DiscoverRoutes} from '../../navigation'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {useSelectedWallet} from '../WalletManager/Context'
import {BrowserNavigator} from './BrowserNavigator'
import {BrowserProvider} from './common/BrowserProvider'
import {useStrings} from './common/useStrings'
import {ListSkeleton} from './useCases/SelectDappFromList/ListSkeleton'
import {SelectDappFromListScreen} from './useCases/SelectDappFromList/SelectDappFromListScreen'

const Stack = createStackNavigator<DiscoverRoutes>()

export const DiscoverNavigator = () => {
  const {theme} = useTheme()
  const strings = useStrings()

  const appStorage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const manager = React.useMemo(() => createDappConnector(appStorage, wallet), [appStorage, wallet])

  return (
    <DappConnectorProvider manager={manager}>
      <BrowserProvider>
        <Stack.Navigator
          screenOptions={{
            ...defaultStackNavigationOptions(theme),
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

const createDappConnector = (appStorage: App.Storage, wallet: YoroiWallet) => {
  const handlerWallet = {
    id: wallet.id,
    networkId: wallet.networkId,
    confirmConnection: async (origin: string) => {
      return new Promise<boolean>((resolve) => {
        // TODO: Use modal with translations here instead of alert
        Alert.alert('Confirm connection', `Do you want to connect to ${origin}?`, [
          {text: 'Cancel', style: 'cancel', onPress: () => resolve(false)},
          {text: 'OK', onPress: () => resolve(true)},
        ])
      })
    },
  }
  const storage = connectionStorageMaker({storage: appStorage.join('dapp-connections/')})
  return dappConnectorMaker(storage, handlerWallet)
}
