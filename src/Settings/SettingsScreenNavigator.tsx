import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import CustomPinScreen from '../../legacy/components/FirstRun/CustomPinScreen'
import BiometricAuthScreen from '../../legacy/components/Send/BiometricAuthScreen'
import ApplicationSettingsScreen from '../../legacy/components/Settings/ApplicationSettingsScreen'
import BiometricsLinkScreen from '../../legacy/components/Settings/BiometricsLinkScreen'
import ChangeCustomPinScreen from '../../legacy/components/Settings/ChangeCustomPinScreen'
import LanguagePickerScreen from '../../legacy/components/Settings/ChangeLanguageScreen'
import ChangePasswordScreen from '../../legacy/components/Settings/ChangePasswordScreen'
import ChangeWalletName from '../../legacy/components/Settings/ChangeWalletName'
import RemoveWalletScreen from '../../legacy/components/Settings/RemoveWalletScreen'
import SupportScreen from '../../legacy/components/Settings/SupportScreen'
import TermsOfServiceScreen from '../../legacy/components/Settings/TermsOfServiceScreen'
import ToggleEasyConfirmationScreen from '../../legacy/components/Settings/ToggleEasyConfirmationScreen'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import {SETTINGS_ROUTES, SETTINGS_TABS} from '../../legacy/RoutesList'
import {COLORS} from '../../legacy/styles/config'
import {WalletSettingsScreen} from './WalletSettingsScreen'

const messages = defineMessages({
  walletTabTitle: {
    id: 'components.settings.walletsettingscreen.tabTitle',
    defaultMessage: '!!!Wallet',
  },
  appTabTitle: {
    id: 'components.settings.applicationsettingsscreen.tabTitle',
    defaultMessage: '!!!Application',
  },
  changeCustomPinTitle: {
    id: 'components.settings.changecustompinscreen.title',
    defaultMessage: '!!!Change PIN',
  },
  changePasswordTitle: {
    id: 'components.settings.changepasswordscreen.title',
    defaultMessage: '!!!Change spending password',
  },
  removeWalletTitle: {
    id: 'components.settings.removewalletscreen.title',
    defaultMessage: '!!!Remove wallet',
  },
  termsOfServiceTitle: {
    id: 'components.settings.termsofservicescreen.title',
    defaultMessage: '!!!Terms of Service Agreement',
  },
  changeWalletNameTitle: {
    id: 'components.settings.changewalletname.title',
    defaultMessage: '!!!Change wallet name',
  },
  supportTitle: {
    id: 'components.settings.settingsscreen.title',
    defaultMessage: '!!!Support',
  },
  toggleEachConfirmationTitle: {
    id: 'components.settings.toggleeasyconfirmationscreen.title',
    defaultMessage: '!!!Easy confirmation',
  },
  customPinTitle: {
    id: 'components.firstrun.custompinscreen.title',
    defaultMessage: '!!!Set PIN',
  },
  settingsTitle: {
    id: 'components.settings.applicationsettingsscreen.title',
    defaultMessage: '!!!Settings',
  },
})

/* eslint-disable @typescript-eslint/no-explicit-any */
type SettingsTabRoutes = {
  'wallet-settings': any
  'app-settings': any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const Tab = createMaterialTopTabNavigator<SettingsTabRoutes>()
const SettingsTabNavigator = () => {
  const intl = useIntl()

  return (
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
      <Tab.Screen name={SETTINGS_TABS.WALLET_SETTINGS} component={WalletSettingsScreen} />
      <Tab.Screen name={SETTINGS_TABS.APP_SETTINGS} component={ApplicationSettingsScreen} />
    </Tab.Navigator>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type SettingsStackNavigatorRoutes = {
  settings: any
  'change-wallet-name': any
  'terms-of-use': any
  support: any
  'fingerprint-link': any
  'remove-wallet': any
  'change-language': any
  'easy-confirmation': any
  'change-password': any
  'change-custom-pin': any
  'bio-authenticate': any
  'setup-custom-pin': any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const Stack = createStackNavigator<SettingsStackNavigatorRoutes>()
export const SettingsScreenNavigator = () => {
  const intl = useIntl()

  return (
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
        options={{title: intl.formatMessage(messages.settingsTitle)}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
        component={ChangeWalletName}
        options={{title: intl.formatMessage(messages.changeWalletNameTitle)}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.TERMS_OF_USE}
        component={TermsOfServiceScreen}
        options={{title: intl.formatMessage(messages.termsOfServiceTitle)}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.SUPPORT}
        component={SupportScreen}
        options={{title: intl.formatMessage(messages.supportTitle)}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.FINGERPRINT_LINK}
        component={BiometricsLinkScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.REMOVE_WALLET}
        component={RemoveWalletScreen}
        options={{title: intl.formatMessage(messages.removeWalletTitle)}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.CHANGE_LANGUAGE}
        component={LanguagePickerScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.EASY_CONFIRMATION}
        component={ToggleEasyConfirmationScreen}
        options={{
          title: intl.formatMessage(messages.toggleEachConfirmationTitle),
        }}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.CHANGE_PASSWORD}
        component={ChangePasswordScreen}
        options={{title: intl.formatMessage(messages.changePasswordTitle)}}
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
        options={{title: intl.formatMessage(messages.customPinTitle)}}
      />
    </Stack.Navigator>
  )
}
