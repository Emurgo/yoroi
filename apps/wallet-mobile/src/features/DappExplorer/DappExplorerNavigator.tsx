import React from 'react'

import {SafeArea} from '../../components/SafeArea'
import {defaultStackNavigationOptions} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {useWalletName} from '../../yoroi-wallets/hooks'
import {NavigationStack} from './common/navigation'
import {ListDappsScreen} from './useCases/ListDappsScreen'
import {OperateDappScreen} from './useCases/OperateDappScreen'

const Stack = NavigationStack

export const DappExplorerNavigator = () => {
  const selectedWallet = useSelectedWallet()
  const walletName = useWalletName(selectedWallet)

  return (
    <SafeArea>
      <Stack.Navigator screenOptions={screenOptions} initialRouteName="dapp-explorer-home">
        <Stack.Screen name="dapp-explorer-home" component={ListDappsScreen} options={{title: walletName}} />

        <Stack.Screen name="dapp-explorer-web-browser" component={OperateDappScreen} options={{title: walletName}} />
      </Stack.Navigator>
    </SafeArea>
  )
}

const screenOptions = {
  ...defaultStackNavigationOptions,
  detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
  gestureEnabled: true,
}
