// @flow
import React from 'react'
import {Button} from '../UiKit'
import {createStackNavigator} from 'react-navigation'

import StakingDashboard from './StakingDashboard'
import {STAKING_DASHBOARD_ROUTES, WALLET_ROUTES} from '../../RoutesList'
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

const DelegationNavigatorSummary = createStackNavigator(
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
      ...defaultStackNavigatorOptions,
    }),
  },
)

export default DelegationNavigatorSummary
