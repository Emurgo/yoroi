import {createStackNavigator} from '@react-navigation/stack'
import {useAsyncStorage} from '@yoroi/common'
import {DappConnector, DappConnectorProvider} from '@yoroi/dapp-connector'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {LoadingBoundary} from '../../components'
import {defaultStackNavigationOptions, DiscoverRoutes} from '../../navigation'
import {useSelectedWallet} from '../WalletManager/Context'
import {BrowserNavigator} from './BrowserNavigator'
import {BrowserProvider} from './common/BrowserProvider'
import {useOpenConfirmConnectionModal} from './common/ConfirmConnectionModal'
import {createDappConnector} from './common/helpers'
import {useStrings} from './common/useStrings'
import {ListSkeleton} from './useCases/SelectDappFromList/ListSkeleton'
import {SelectDappFromListScreen} from './useCases/SelectDappFromList/SelectDappFromListScreen'

const Stack = createStackNavigator<DiscoverRoutes>()

export const DiscoverNavigator = () => {
  const {atoms, color} = useTheme()
  const strings = useStrings()

  const manager = useDappConnectorManager()

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

const useDappConnectorManager = () => {
  const appStorage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const {openConfirmConnectionModal} = useOpenConfirmConnectionModal()
  const confirmConnection = React.useCallback(
    async (origin: string, manager: DappConnector) => {
      const recommendedDApps = await manager.getDAppList()
      const selectedDapp = recommendedDApps.dapps.find((dapp) => dapp.origins.includes(origin))
      return new Promise<boolean>((resolve) => {
        openConfirmConnectionModal({
          name: selectedDapp?.name ?? origin,
          website: origin,
          logo: selectedDapp?.logo ?? '', // TODO: Add placeholder
          onConfirm: () => resolve(true),
          onClose: () => {
            console.log('confirmConnection onClose') // TODO: Fix close
            resolve(false)
          },
        })
      })
    },
    [openConfirmConnectionModal],
  )

  const signTx = React.useCallback(() => {
    return Promise.resolve('passwordpassword')
  }, [])

  return createDappConnector({appStorage, wallet, confirmConnection, signTx})
}
