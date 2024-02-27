import React from 'react'

import {StatusBar} from '../../components'
import {defaultStackNavigationOptions} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {useWalletName} from '../../yoroi-wallets/hooks'
import {NavigationStack} from './common/navigation'
import {SafeArea} from './common/SafeArea'
import {HomeScreen} from './useCases/HomeScreen'

const Stack = NavigationStack

export const DappExplorerNavigator = () => {
  const selectedWallet = useSelectedWallet()
  const walletName = useWalletName(selectedWallet)

  return (
    <SafeArea>
      <StatusBar type="dark" />

      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="dapp-explorer-home" component={HomeScreen} options={{title: walletName}} />
      </Stack.Navigator>
    </SafeArea>
  )
}

const screenOptions = {
  ...defaultStackNavigationOptions,
  detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
  gestureEnabled: true,
}
