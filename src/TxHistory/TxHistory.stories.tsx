import {createStackNavigator} from '@react-navigation/stack'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../storybook'
import {defaultStackNavigatorOptions} from '../navigationOptions'
import {SelectedWalletProvider} from '../SelectedWallet'
import {COLORS} from '../theme'
import {MockAppStateWrapper, mockV2NavigatorOptions} from '../yoroi-wallets/utils/mocks'
import {TxHistory as TxHistoryScreen} from './TxHistory'

storiesOf('V2/TxHistory', module)
  .add('default', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <TxHistoryScreen />
      </SelectedWalletProvider>
    )
  })
  .add('byron', () => {
    return (
      <SelectedWalletProvider wallet={{...mockWallet, walletImplementationId: 'haskell-byron'}}>
        <TxHistoryScreen />
      </SelectedWalletProvider>
    )
  })
  .add('No transactions', () => {
    const Stack = createStackNavigator()
    const walletName = 'Wallet-1'
    return (
      <MockAppStateWrapper>
        {/* Need to simulate a navigator because it uses the NavigatorState */}
        <Stack.Navigator screenOptions={{...defaultStackNavigatorOptions}} initialRouteName={walletName}>
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
