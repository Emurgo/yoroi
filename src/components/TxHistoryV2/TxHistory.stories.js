// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'
import {createStackNavigator} from '@react-navigation/stack'

import TxHistoryScreen from './TxHistory'
import {MockAppStateWrapper, mockScreenWithSettingsOption} from '../../utils/mocks'
import {defaultStackNavigatorOptions} from '../../navigationOptions'

storiesOf('@Revamp/TxHistory', module).add('Default', () => {
  const Stack = createStackNavigator<any, any, any>()
  const walletName = 'Wallet-1'
  return (
    <MockAppStateWrapper>
      {/* Need to simulate a navigator because it uses the NavigatorState */}
      <Stack.Navigator screenOptions={{...defaultStackNavigatorOptions}} initialRouteName={walletName}>
        <Stack.Screen
          options={mockScreenWithSettingsOption(walletName)}
          name={walletName}
          component={TxHistoryScreen}
        />
      </Stack.Navigator>
    </MockAppStateWrapper>
  )
})
