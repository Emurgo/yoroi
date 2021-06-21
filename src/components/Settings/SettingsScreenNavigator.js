// @flow

import React from 'react'
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {createStackNavigator} from '@react-navigation/stack'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import WalletSettingsScreen from './WalletSettingsScreen'
import ApplicationSettingsScreen from './ApplicationSettingsScreen'
import ChangeWalletName from './ChangeWalletName'
import SupportScreen from './SupportScreen'
import LanguagePickerScreen from './ChangeLanguageScreen'
import BiometricsLinkScreen from './BiometricsLinkScreen'
import ToggleEasyConfirmatioScreen from './ToggleEasyConfirmatioScreen'
import TermsOfServiceScreen from './TermsOfServiceScreen'
import RemoveWalletScreen from './RemoveWalletScreen'
import ChangePasswordScreen from './ChangePasswordScreen'
import ChangeCustomPinScreen from './ChangeCustomPinScreen'
import CustomPinScreen from '../FirstRun/CustomPinScreen'
import BiometricAuthScreen from '../Send/BiometricAuthScreen'
import {SETTINGS_ROUTES, SETTINGS_TABS} from '../../RoutesList'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'

import {COLORS} from '../../styles/config'

const messages = defineMessages({
  walletTabTitle: {
    id: 'components.settings.walletsettingscreen.tabTitle',
    defaultMessage: 'Wallet',
  },
  appTabTitle: {
    id: 'components.settings.applicationsettingsscreen.tabTitle',
    defaultMessage: 'Application',
  },
  changeCustomPinTitle: {
    id: 'components.settings.changecustompinscreen.title',
    defaultMessage: 'Change PIN',
  },
})

type SettingsTabRoutes = {
  'wallet-settings': any,
  'app-settings': any,
}

const Tab = createMaterialTopTabNavigator<any, SettingsTabRoutes, any>()
const SettingsTabNavigator = injectIntl(({intl}: {intl: IntlShape}) => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      tabBarLabel:
        route.name === SETTINGS_TABS.WALLET_SETTINGS
          ? intl.formatMessage(messages.walletTabTitle)
          : intl.formatMessage(messages.appTabTitle),
    })}
    tabBarOptions={{
      style: {
        backgroundColor: COLORS.BACKGROUND_BLUE,
        elevation: 0,
        shadowOpacity: 0,
      },
      tabStyle: {
        elevation: 0,
        shadowOpacity: 0,
      },
      labelStyle: {
        color: COLORS.WHITE,
      },
      indicatorStyle: {
        backgroundColor: '#fff',
        height: 2,
      },
    }}
  >
    <Tab.Screen
      name={SETTINGS_TABS.WALLET_SETTINGS}
      component={WalletSettingsScreen}
    />
    <Tab.Screen
      name={SETTINGS_TABS.APP_SETTINGS}
      component={ApplicationSettingsScreen}
    />
  </Tab.Navigator>
))

type SettingsStackNavigatorRoutes = {
  settings: any,
  'change-wallet-name': any,
  'terms-of-use': any,
  support: any,
  'fingerprint-link': any,
  'remove-wallet': any,
  'change-language': any,
  'easy-confirmation': any,
  'change-password': any,
  'change-custom-pin': any,
  'bio-authenticate': any,
  'setup-custom-pin': any,
}

const Stack = createStackNavigator<any, SettingsStackNavigatorRoutes, any>()
const SettingsScreenNavigator = injectIntl(({intl}: {intl: IntlShape}) => (
  <Stack.Navigator
    screenOptions={{
      ...defaultNavigationOptions,
      ...defaultStackNavigatorOptions,
    }}
    initialRouteName={SETTINGS_ROUTES.MAIN}
  >
    <Stack.Screen
      name={SETTINGS_ROUTES.MAIN}
      component={SettingsTabNavigator}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      component={ChangeWalletName}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.TERMS_OF_USE}
      component={TermsOfServiceScreen}
    />
    <Stack.Screen name={SETTINGS_ROUTES.SUPPORT} component={SupportScreen} />
    <Stack.Screen
      name={SETTINGS_ROUTES.FINGERPRINT_LINK}
      component={BiometricsLinkScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.REMOVE_WALLET}
      component={RemoveWalletScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.CHANGE_LANGUAGE}
      component={LanguagePickerScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.EASY_COMFIRMATION}
      component={ToggleEasyConfirmatioScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.CHANGE_PASSWORD}
      component={ChangePasswordScreen}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.CHANGE_CUSTOM_PIN}
      component={ChangeCustomPinScreen}
      options={{
        title: intl.formatMessage(messages.changeCustomPinTitle),
        headerStyle: {
          ...defaultNavigationOptions.headerStyle,
          elevation: 0, // turn off header shadows on Android
        },
      }}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.BIO_AUTHENTICATE}
      component={BiometricAuthScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name={SETTINGS_ROUTES.SETUP_CUSTOM_PIN}
      component={CustomPinScreen}
    />
  </Stack.Navigator>
))

export default SettingsScreenNavigator
