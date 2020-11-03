// @flow
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import {Button} from '../UiKit'
import StakingCenter from './StakingCenter'
import BiometricAuthScreen from '../Send/BiometricAuthScreen'
import DelegationConfirmation from './DelegationConfirmation'
import {
  WALLET_ROOT_ROUTES,
  STAKING_CENTER_ROUTES,
  SEND_ROUTES,
} from '../../RoutesList'
import iconGear from '../../assets/img/gear.png'

import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'

import styles from '../TxHistory/styles/SettingsButton.style'

const Stack = createStackNavigator()

// TODO(navigation)
const StakingCenterNavigator = () => (
  <Stack.Navigator
    screenOptions={({route}) => ({
      title: route.params?.title ?? undefined,
      ...defaultNavigationOptions,
      ...defaultStackNavigatorOptions,
    })}
  >
    <Stack.Screen
      name={STAKING_CENTER_ROUTES.MAIN}
      component={StakingCenter}
      options={({navigation}) => ({
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
    />
    <Stack.Screen
      name={SEND_ROUTES.BIOMETRICS_SIGNING}
      component={BiometricAuthScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
)

export default StakingCenterNavigator
