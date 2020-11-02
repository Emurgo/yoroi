// @flow
import React from 'react'
import {Button} from '../UiKit'
import {createStackNavigator} from '@react-navigation/stack'

import StakingDashboard from './StakingDashboard'
import BiometricAuthScreen from '../Send/BiometricAuthScreen'
import {
  STAKING_DASHBOARD_ROUTES,
  WALLET_ROUTES,
  SEND_ROUTES,
} from '../../RoutesList'
import SettingsScreenNavigator from '../Settings/SettingsScreenNavigator'
import iconGear from '../../assets/img/gear.png'
import {isJormungandr} from '../../config/networks'
import HeaderBackButton from '../UiKit/HeaderBackButton'

import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
  jormunNavigationOptions,
} from '../../navigationOptions'

import styles from '../TxHistory/styles/SettingsButton.style'

const _DelegationNavigatorSummary = // createStackNavigator(
[
  {
    [STAKING_DASHBOARD_ROUTES.MAIN]: {
      screen: StakingDashboard,
      navigationOptions: ({navigation}) => {
        const extraNavOptions = isJormungandr(navigation.getParam('networkId'))
          ? jormunNavigationOptions
          : {}
        return {
          title: navigation.getParam('title'),
          headerRight: (
            <Button
              style={styles.settingsButton}
              onPress={() => navigation.navigate(WALLET_ROUTES.SETTINGS)}
              iconImage={iconGear}
              title=""
              withoutBackground
            />
          ),
          ...defaultNavigationOptions,
          ...extraNavOptions,
        }
      },
    },
    [SEND_ROUTES.BIOMETRICS_SIGNING]: {
      screen: BiometricAuthScreen,
      navigationOptions: {
        header: null,
      },
    },
    [WALLET_ROUTES.SETTINGS]: {
      screen: SettingsScreenNavigator,
      navigationOptions: {
        header: null,
        ...defaultNavigationOptions,
      },
    },
  },
  {
    initialRouteName: STAKING_DASHBOARD_ROUTES.MAIN,
    navigationOptions: ({navigation}) => ({
      headerLeft: <HeaderBackButton navigation={navigation} />,
    }),
    ...defaultStackNavigatorOptions,
  },
]

const Stack = createStackNavigator()

// TODO(navigation)
const DelegationNavigatorSummary = () => (
  <Stack.Navigator>
    <Stack.Screen name={STAKING_DASHBOARD_ROUTES.MAIN} component={StakingDashboard} />
  </Stack.Navigator>
)

export default DelegationNavigatorSummary
