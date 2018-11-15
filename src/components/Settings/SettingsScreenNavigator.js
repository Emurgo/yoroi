// @flow
import React from 'react'
import {
  createStackNavigator,
  createMaterialTopTabNavigator,
} from 'react-navigation'
import {HeaderBackButton} from 'react-navigation-stack'

import WalletSettingsScreen from './WalletSettingsScreen'
import ApplicationSettingsScreen from './ApplicationSettingsScreen'
import ChangeWalletName from './ChangeWalletName'
import SupportScreen from './SupportScreen'
import FingerprintLinkScreen from './FingerprintLinkScreen'
import TermsOfServiceScreen from './TermsOfServiceScreen'
import {SETTINGS_ROUTES} from '../../RoutesList'

const defaultNavigationOptions = {
  headerStyle: {
    backgroundColor: '#254BC9',
    borderBottomWidth: 0,
  },
  headerTintColor: '#fff',
}

const SettingsScreenNavigator = createStackNavigator(
  {
    [SETTINGS_ROUTES.MAIN]: createMaterialTopTabNavigator(
      {
        Wallet: WalletSettingsScreen,
        Application: ApplicationSettingsScreen,
      },
      {
        tabBarOptions: {
          upperCaseLabel: false,
          style: {
            backgroundColor: '#254BC9',
            elevation: 0,
            shadowOpacity: 0,
          },
          tabStyle: {
            elevation: 0,
            shadowOpacity: 0,
          },
          indicatorStyle: {
            backgroundColor: '#fff',
            height: 2,
          },
        },
      },
    ),
    [SETTINGS_ROUTES.CHANGE_WALLET_NAME]: ChangeWalletName,
    [SETTINGS_ROUTES.TERMS_OF_USE]: TermsOfServiceScreen,
    [SETTINGS_ROUTES.SUPPORT]: SupportScreen,
    [SETTINGS_ROUTES.FINGERPRINT_LINK]: FingerprintLinkScreen,
  },
  {
    initialRouteName: SETTINGS_ROUTES.MAIN,
    navigationOptions: ({navigation}) => ({
      title:
        navigation.state.routes &&
        navigation.state.routes[navigation.state.index].params
          ? navigation.state.routes[navigation.state.index].params.title
          : navigation.getParam('title'),
      // Nested stack navigators have problems with back button
      // https://github.com/react-navigation/react-navigation/issues/115
      headerLeft: <HeaderBackButton onPress={() => navigation.goBack(null)} />,
      ...defaultNavigationOptions,
    }),
  },
)

export default SettingsScreenNavigator
