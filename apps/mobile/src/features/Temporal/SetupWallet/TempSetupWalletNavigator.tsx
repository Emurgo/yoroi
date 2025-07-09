import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {Text} from 'react-native'

const Stack = createStackNavigator<any>()
export const TempSetupWalletNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="setup-wallet-init">
        {() => <Text>SETUP WALLET INIT</Text>}
      </Stack.Screen>
    </Stack.Navigator>
  )
}
