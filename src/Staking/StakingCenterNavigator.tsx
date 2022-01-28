/* eslint-disable @typescript-eslint/no-explicit-any */
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import iconGear from '../../assets/img/gear.png'
import DelegationConfirmation from '../../legacy/components/Delegation/DelegationConfirmation'
import StakingCenter from '../../legacy/components/Delegation/StakingCenter'
import styles from '../../legacy/components/Delegation/styles/SettingsButton.style'
import BiometricAuthScreen from '../../legacy/components/Send/BiometricAuthScreen'
import {Button} from '../../legacy/components/UiKit'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import {SEND_ROUTES, STAKING_CENTER_ROUTES, WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'

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
          headerRight: () => (
            <Button
              style={styles.settingsButton}
              onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.SETTINGS)}
              iconImage={iconGear}
              title=""
              withoutBackground
            />
          ),
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
