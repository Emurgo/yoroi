// @flow
import React from 'react'
import {Button} from '../UiKit'
import {createStackNavigator} from 'react-navigation'
import DelegationSummary from './DelegationSummary'
import {SHELLEY_WALLET_ROUTES, WALLET_ROUTES} from '../../RoutesList'
import SettingsScreenNavigator from '../Settings/SettingsScreenNavigator'
import iconGear from '../../assets/img/gear.png'

import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'

import styles from '../TxHistory/styles/SettingsButton.style'

const DelegationNavigatorSummary = createStackNavigator(
  {
    [SHELLEY_WALLET_ROUTES.DELEGATION_SUMMARY]: {
      screen: DelegationSummary,
      navigationOptions: ({navigation}) => ({
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
      }),
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
    initialRouteName: SHELLEY_WALLET_ROUTES.DELEGATION_SUMMARY,
    ...defaultStackNavigatorOptions,
  },
)

export default DelegationNavigatorSummary
