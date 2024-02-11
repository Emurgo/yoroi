import React from 'react'
import {SafeArea} from './common/SafeArea'
import {StatusBar} from '../../components'
import {HomeScreen} from './useCases/HomeScreen'
import {defaultStackNavigationOptions} from '../../navigation'
import {NavigationStack} from './common/navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {useWalletName} from '../../yoroi-wallets/hooks'

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
