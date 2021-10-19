// @flow

import {createStackNavigator} from '@react-navigation/stack'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {defaultStackNavigatorOptions} from '../../navigationOptions'
import {COLORS} from '../../styles/config'
import {MockAppStateWrapper, mockV2NavigatorOptions} from '../../utils/mocks'
import TxHistoryScreen from './TxHistory'

storiesOf('@Revamp/TxHistory', module).add('Default', () => {
  const Stack = createStackNavigator<any, any, any>()
  const walletName = 'Wallet-1'
  return (
    <MockAppStateWrapper>
      {/* Need to simulate a navigator because it uses the NavigatorState */}
      <Stack.Navigator
        screenOptions={{...defaultStackNavigatorOptions, ...{cardStyle: {backgroundColor: 'yellow'}}}}
        initialRouteName={walletName}
      >
        <Stack.Screen
          options={mockV2NavigatorOptions(
            {
              title: walletName,
              headerStyle: {
                backgroundColor: COLORS.BACKGROUND_GRAY,
                elevation: 0,
                shadowOpacity: 0,
              },
              headerTintColor: COLORS.ERROR_TEXT_COLOR_DARK,
            },
            ['settings'],
          )}
          name={walletName}
          component={TxHistoryScreen}
        />
      </Stack.Navigator>
    </MockAppStateWrapper>
  )
})
