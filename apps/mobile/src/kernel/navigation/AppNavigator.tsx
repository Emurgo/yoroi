import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'
import {TempPinLoginScreen} from '../../features/Temporal/Auth/TempPinLoginScreen'
import {TempSetupWalletNavigator} from '../../features/Temporal/SetupWallet/TempSetupWalletNavigator'

const Stack = createStackNavigator<any>()

export const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen name="Login" component={TempPinLoginScreen} />
        <Stack.Screen
          name="setup-wallet"
          options={{headerShown: false}}
          component={TempSetupWalletNavigator}
        />
      </Stack.Group>
    </Stack.Navigator>
  )
}
