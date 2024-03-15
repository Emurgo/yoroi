import React from 'react'

import {useStatusBar} from '../../components/hooks/useStatusBar'
import {SafeArea} from '../../components/SafeArea'
import {defaultStackNavigationOptions} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {useWalletName} from '../../yoroi-wallets/hooks'
import {NavigationStack} from './common/navigation'
import {HomeScreen} from './useCases/HomeScreen'
import {WebBrowserScreen} from './useCases/WebBrowserScreen'

const Stack = NavigationStack

export const DappExplorerNavigator = () => {
  const selectedWallet = useSelectedWallet()
  const walletName = useWalletName(selectedWallet)
  useStatusBar()

  return (
    <SafeArea>
      <Stack.Navigator screenOptions={screenOptions} initialRouteName="dapp-explorer-home">
        <Stack.Screen name="dapp-explorer-home" component={HomeScreen} options={{title: walletName}} />

        <Stack.Screen name="dapp-explorer-web-browser" component={WebBrowserScreen} options={{title: walletName}} />
      </Stack.Navigator>
    </SafeArea>
  )
}

const screenOptions = {
  ...defaultStackNavigationOptions,
  detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
  gestureEnabled: true,
}
