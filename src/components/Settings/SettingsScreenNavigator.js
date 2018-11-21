// @flow
import React from 'react'
import {
  createStackNavigator,
  createMaterialTopTabNavigator,
} from 'react-navigation'
import HeaderBackButton from '../UiKit/HeaderBackButton'

import WalletSettingsScreen from './WalletSettingsScreen'
import ApplicationSettingsScreen from './ApplicationSettingsScreen'
import ChangeWalletName from './ChangeWalletName'
import SupportScreen from './SupportScreen'
import LanguagePickerScreen from './ChangeLanguageScreen'
import BiometricsLinkScreen from './BiometricsLinkScreen'
import ToggleEasyConfirmatioScreen from './ToggleEasyConfirmatioScreen'
import TermsOfServiceScreen from './TermsOfServiceScreen'
import RemoveWalletScreen from './RemoveWalletScreen'
import {SETTINGS_ROUTES} from '../../RoutesList'
import {defaultNavigationOptions} from '../../navigationOptions'

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
    [SETTINGS_ROUTES.FINGERPRINT_LINK]: BiometricsLinkScreen,
    [SETTINGS_ROUTES.REMOVE_WALLET]: RemoveWalletScreen,
    [SETTINGS_ROUTES.CHANGE_LANGUAGE]: {
      screen: LanguagePickerScreen,
      navigationOptions: {
        header: null,
      },
    },
    [SETTINGS_ROUTES.EASY_COMFIRMATION]: ToggleEasyConfirmatioScreen,
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
      headerLeft: (
        <HeaderBackButton shouldPopOutOfLastNavigator navigation={navigation} />
      ),
      ...defaultNavigationOptions,
    }),
  },
)

export default SettingsScreenNavigator
