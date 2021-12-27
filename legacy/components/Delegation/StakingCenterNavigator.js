// @flow

import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import type {IntlShape} from 'react-intl'
import {defineMessages, injectIntl} from 'react-intl'

import iconGear from '../../assets/img/gear.png'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../navigationOptions'
import {SEND_ROUTES, STAKING_CENTER_ROUTES, WALLET_ROOT_ROUTES} from '../../RoutesList'
import BiometricAuthScreen from '../Send/BiometricAuthScreen'
import {Button} from '../UiKit'
import DelegationConfirmation from './DelegationConfirmation'
import StakingCenter from './StakingCenter'
import styles from './styles/SettingsButton.style'

type StakingCenterRoutes = {
  'staking-center': any,
  'delegation-confirmation': any,
  'biometrics-signing': any,
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

const Stack = createStackNavigator<any, StakingCenterRoutes, any>()

const StakingCenterNavigator = injectIntl(({intl}: {intl: IntlShape}) => (
  <Stack.Navigator
    screenOptions={({route}) => ({
      // $FlowFixMe mixed is not compatible with string
      title: route.params?.title ?? undefined,
      ...defaultNavigationOptions,
      ...defaultStackNavigatorOptions,
    })}
  >
    <Stack.Screen
      name={STAKING_CENTER_ROUTES.MAIN}
      component={StakingCenter}
      options={({navigation}) => ({
        title: intl.formatMessage(messages.title),
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
      options={{title: intl.formatMessage(messages.title)}}
    />
    <Stack.Screen
      name={SEND_ROUTES.BIOMETRICS_SIGNING}
      component={BiometricAuthScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
))

export default StakingCenterNavigator
