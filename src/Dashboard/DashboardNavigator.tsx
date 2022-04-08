/* eslint-disable @typescript-eslint/no-explicit-any */
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {isJormungandr} from '../../legacy/config/networks'
import {BiometricAuthScreen} from '../BiometricAuth'
import {SettingsButton} from '../components/Button'
import {useWalletName} from '../hooks'
import {UI_V2} from '../legacy/config'
import {SEND_ROUTES, STAKING_CENTER_ROUTES, STAKING_DASHBOARD_ROUTES, WALLET_ROOT_ROUTES} from '../legacy/RoutesList'
import {defaultNavigationOptions, defaultStackNavigatorOptions, jormunNavigationOptions} from '../navigationOptions'
import {useSelectedWallet} from '../SelectedWallet'
import {DelegationConfirmation} from '../Staking'
import {StakingCenter} from '../Staking/StakingCenter'
import {Dashboard} from './Dashboard'

const Stack = createStackNavigator<{
  'staking-dashboard': any
  'staking-center': any
  'biometrics-signing': any
}>()

export const DashboardNavigator = () => {
  const wallet = useSelectedWallet()
  const walletName = useWalletName(wallet)
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenOptions={({route}) => {
        const extraOptions = isJormungandr(route.params?.networkId) ? jormunNavigationOptions : {}
        return {
          cardStyle: {
            backgroundColor: 'transparent',
          },
          title: route.params?.title ?? undefined,
          ...defaultNavigationOptions,
          ...defaultStackNavigatorOptions,
          ...extraOptions,
        }
      }}
      initialRouteName={STAKING_DASHBOARD_ROUTES.MAIN}
    >
      <Stack.Screen
        name={STAKING_DASHBOARD_ROUTES.MAIN}
        component={Dashboard}
        options={({navigation}) => ({
          title: walletName,
          headerRight: () => <SettingsButton onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)} />,
          headerRightContainerStyle: {paddingRight: 16},
        })}
      />
      <Stack.Screen
        name={SEND_ROUTES.BIOMETRICS_SIGNING}
        component={BiometricAuthScreen}
        options={{headerShown: false}}
      />
      {UI_V2 && (
        <Stack.Screen name={STAKING_CENTER_ROUTES.MAIN} component={StakingCenter} options={{title: strings.title}} />
      )}
      {UI_V2 && (
        <Stack.Screen
          name={STAKING_CENTER_ROUTES.DELEGATION_CONFIRM as any}
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
