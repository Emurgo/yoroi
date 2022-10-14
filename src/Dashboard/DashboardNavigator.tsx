/* eslint-disable @typescript-eslint/no-explicit-any */
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {SettingsButton} from '../components/Button'
import {useWalletName} from '../hooks'
import {DashboardRoutes, defaultStackNavigationOptions, useWalletNavigation} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {DelegationConfirmation} from '../Staking'
import {StakingCenter} from '../Staking/StakingCenter'
import {Dashboard} from './Dashboard'

const Stack = createStackNavigator<DashboardRoutes>()
export const DashboardNavigator = () => {
  const wallet = useSelectedWallet()
  const walletName = useWalletName(wallet)
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions,
        cardStyle: {
          backgroundColor: 'transparent',
        },
      }}
      initialRouteName="staking-dashboard-main"
    >
      <Stack.Screen
        name="staking-dashboard-main"
        component={Dashboard}
        options={{
          title: walletName,
          headerRight: () => <HeaderRight />,
        }}
      />
      <Stack.Screen //
        name="staking-center"
        component={StakingCenter}
        options={{title: strings.title}}
      />
      <Stack.Screen
        name="delegation-confirmation"
        component={DelegationConfirmation}
        options={{title: strings.title}}
      />
    </Stack.Navigator>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
  }
}

const messages = defineMessages({
  title: {
    id: 'components.stakingcenter.title',
    defaultMessage: '!!!Staking Center',
  },
})

const HeaderRight = () => {
  const {navigateToSettings} = useWalletNavigation()

  return <SettingsButton style={{paddingRight: 16}} onPress={() => navigateToSettings()} />
}
