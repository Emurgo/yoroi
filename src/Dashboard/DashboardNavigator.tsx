import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import DelegationConfirmation from '../../legacy/components/Delegation/DelegationConfirmation'
import {UI_V2} from '../../legacy/config/config'
import {SettingsButton} from '../components/Button'
import {useWalletName} from '../hooks'
import {AppRouteParams, DashboardRoutes, defaultBaseNavigationOptions} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
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
        cardStyle: {
          backgroundColor: 'transparent',
        },
        ...defaultBaseNavigationOptions,
      }}
      initialRouteName="staking-dashboard-main"
    >
      <Stack.Screen
        name="staking-dashboard-main"
        component={Dashboard}
        options={({navigation}: {navigation: AppRouteParams}) => ({
          title: walletName,
          headerRight: () => (
            <SettingsButton
              onPress={() =>
                navigation.navigate('app-root', {
                  screen: 'settings',
                  params: {
                    screen: 'settings-main',
                  },
                })
              }
            />
          ),
          headerRightContainerStyle: {paddingRight: 16},
        })}
      />
      {UI_V2 && (
        <Stack.Screen //
          name="staking-center"
          component={StakingCenter}
          options={{title: strings.title}}
        />
      )}
      {UI_V2 && (
        <Stack.Screen
          name="delegation-confirmation"
          component={DelegationConfirmation}
          options={{title: strings.title}}
        />
      )}
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
