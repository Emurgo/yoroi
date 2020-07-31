// @flow
import React from 'react'
import {Button} from '../UiKit'
import {createStackNavigator} from 'react-navigation'
import DelegationSummary from './DelegationSummary'
import {DELEGATION_SUMMARY_ROUTES, WALLET_ROUTES} from '../../RoutesList'
import SettingsScreenNavigator from '../Settings/SettingsScreenNavigator'
import iconGear from '../../assets/img/gear.png'

import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
  jormunNavigationOptions,
} from '../../navigationOptions'

import styles from '../TxHistory/styles/SettingsButton.style'

const DelegationNavigatorSummary = createStackNavigator(
  {
    [DELEGATION_SUMMARY_ROUTES.MAIN]: {
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
        ...jormunNavigationOptions,
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
    initialRouteName: DELEGATION_SUMMARY_ROUTES.MAIN,
    ...defaultStackNavigatorOptions,
  },
)

export default DelegationNavigatorSummary
