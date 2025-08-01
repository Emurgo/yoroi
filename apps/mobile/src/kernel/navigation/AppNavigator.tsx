import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {DevMenu} from '~/features/DevMenu'
import {SearchProvider} from '~/features/Search/SearchContext'
import {SettingsScreenNavigator} from '~/features/Settings/SettingsScreenNavigator'
import {SetupWalletNavigator} from '~/features/SetupWallet/SetupWalletNavigator'
import {TempPinLoginScreen} from '~/features/Temporal_To_Remove/Auth/TempPinLoginScreen'
import {InitialScreenNavigator} from '~/features/Temporal_To_Remove/InitialScreen/InitialScreenNavigatorNavigator'
import {TempTestSearchScreen} from '~/features/Temporal_To_Remove/Search/TempTestSearchScreen'
import {TxHistoryNavigator} from '~/features/Transactions/TxHistoryNavigator'
import {SelectWalletFromList} from '~/features/WalletManager/screens/SelectWalletFromListScreen/SelectWalletFromListScreen'
import {Modal} from '~/ui/Modal/ModalScreen'

const Stack = createStackNavigator<any>()

export const AppNavigator = () => {
  return (
    <SearchProvider>
      <Stack.Navigator>
        <Stack.Group>
          <Stack.Screen name="Login" component={TempPinLoginScreen} />
          <Stack.Screen
            name="initial"
            options={{headerShown: false}}
            component={InitialScreenNavigator}
          />
          {/* <Stack.Screen
            name="manage-wallets"
            options={{headerShown: false}}
            component={WalletNavigator}
          /> */}
          <Stack.Screen
            name="wallet-selection"
            options={{headerShown: false}}
            component={SelectWalletFromList}
          />
          <Stack.Screen
            name="tx-list"
            options={{headerShown: false}}
            component={TxHistoryNavigator}
          />
          <Stack.Screen
            name="settings"
            options={{headerShown: false}}
            component={SettingsScreenNavigator}
          />
          <Stack.Screen
            name="wallet-setup"
            options={{headerShown: false}}
            component={SetupWalletNavigator}
          />
          <Stack.Screen name="dev">
            {() => <DevMenu visible={true} />}
          </Stack.Screen>
          <Stack.Screen
            name="test-list-search"
            component={TempTestSearchScreen}
          />
        </Stack.Group>
      </Stack.Navigator>
      <Modal />
    </SearchProvider>
  )
}
