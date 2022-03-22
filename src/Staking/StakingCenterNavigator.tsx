/* eslint-disable @typescript-eslint/no-explicit-any */
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import {SEND_ROUTES, STAKING_CENTER_ROUTES, WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {BiometricAuthScreen} from '../BiometricAuth'
import {SettingsButton} from '../components/Button'
import {DelegationConfirmation} from './DelegationConfirmation'
import {StakingCenter} from './StakingCenter/StakingCenter'

type StakingCenterRoutes = {
  'staking-center': any
  'delegation-confirmation': any
  'biometrics-signing': any
}

const Stack = createStackNavigator<StakingCenterRoutes>()

export const StakingCenterNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultNavigationOptions,
        ...defaultStackNavigatorOptions,
      }}
    >
      <Stack.Screen
        name={STAKING_CENTER_ROUTES.MAIN}
        component={StakingCenter}
        options={({navigation}) => ({
          title: strings.title,
          headerRight: () => <SettingsButton onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)} />,
          headerRightContainerStyle: {paddingRight: 16},
        })}
      />

      <Stack.Screen
        name={STAKING_CENTER_ROUTES.DELEGATION_CONFIRM}
        component={DelegationConfirmation}
        options={{title: strings.title}}
      />

      <Stack.Screen
        name={SEND_ROUTES.BIOMETRICS_SIGNING}
        component={BiometricAuthScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    delegationConfirmationTitle: intl.formatMessage(messages.delegationConfirmationTitle),
  }
}

const messages = defineMessages({
  title: {
    id: 'components.stakingcenter.title',
    defaultMessage: '!!!Staking Center',
  },
  delegationConfirmationTitle: {
    id: 'components.stakingcenter.confirmDelegation.title',
    defaultMessage: '!!!Confirm delegation',
  },
})
