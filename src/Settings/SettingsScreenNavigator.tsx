import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../../legacy/navigationOptions'
import {SETTINGS_ROUTES, SETTINGS_TABS} from '../../legacy/RoutesList'
import {COLORS} from '../../legacy/styles/config'
import {BiometricAuthScreen} from '../BiometricAuth'
import {ApplicationSettingsScreen} from './ApplicationSettings'
import {BiometricsLinkScreen} from './BiometricsLink/'
import {ChangeLanguageScreen} from './ChangeLanguage'
import {ChangePasswordScreen} from './ChangePassword'
import {ChangePinScreen} from './ChangePin'
import {ChangeWalletName} from './ChangeWalletName'
import {CustomPinScreen} from './CustomPin'
import {RemoveWalletScreen} from './RemoveWallet'
import {SupportScreen} from './Support'
import {TermsOfServiceScreen} from './TermsOfService'
import {ToggleEasyConfirmationScreen} from './ToggleEasyConfirmation'
import {WalletSettingsScreen} from './WalletSettings'

/* eslint-disable @typescript-eslint/no-explicit-any */
const Stack = createStackNavigator<{
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
}>()
/* eslint-enable @typescript-eslint/no-explicit-any */
export const SettingsScreenNavigator = () => {
  const strings = useStrings()

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
        options={{title: strings.settingsTitle}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
        component={ChangeWalletName}
        options={{title: strings.changeWalletNameTitle}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.TERMS_OF_USE}
        component={TermsOfServiceScreen}
        options={{title: strings.termsOfServiceTitle}}
      />
      <Stack.Screen //
        name={SETTINGS_ROUTES.SUPPORT}
        component={SupportScreen}
        options={{title: strings.supportTitle}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.FINGERPRINT_LINK}
        component={BiometricsLinkScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.REMOVE_WALLET}
        component={RemoveWalletScreen}
        options={{title: strings.removeWalletTitle}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.CHANGE_LANGUAGE}
        component={ChangeLanguageScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.EASY_CONFIRMATION}
        component={ToggleEasyConfirmationScreen}
        options={{title: strings.toggleEachConfirmationTitle}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.CHANGE_PASSWORD}
        component={ChangePasswordScreen}
        options={{title: strings.changePasswordTitle}}
      />
      <Stack.Screen
        name={SETTINGS_ROUTES.CHANGE_CUSTOM_PIN}
        component={ChangePinScreen}
        options={{
          title: strings.changeCustomPinTitle,
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
        options={{title: strings.customPinTitle}}
      />
    </Stack.Navigator>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const Tab = createMaterialTopTabNavigator<{
  'wallet-settings': any
  'app-settings': any
}>()
/* eslint-enable @typescript-eslint/no-explicit-any */
const SettingsTabNavigator = () => {
  const strings = useStrings()

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarLabel: route.name === SETTINGS_TABS.WALLET_SETTINGS ? strings.walletTabTitle : strings.appTabTitle,
      })}
      tabBarOptions={{
        style: {backgroundColor: COLORS.BACKGROUND_BLUE, elevation: 0, shadowOpacity: 0},
        tabStyle: {elevation: 0, shadowOpacity: 0},
        labelStyle: {color: COLORS.WHITE},
        indicatorStyle: {backgroundColor: '#fff', height: 2},
      }}
    >
      <Tab.Screen name={SETTINGS_TABS.WALLET_SETTINGS} component={WalletSettingsScreen} />
      <Tab.Screen name={SETTINGS_TABS.APP_SETTINGS} component={ApplicationSettingsScreen} />
    </Tab.Navigator>
  )
}

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
    id: 'components.settings.applicationsettingsscreen.changePin',
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

const useStrings = () => {
  const intl = useIntl()

  return {
    walletTabTitle: intl.formatMessage(messages.walletTabTitle),
    appTabTitle: intl.formatMessage(messages.appTabTitle),
    changeCustomPinTitle: intl.formatMessage(messages.changeCustomPinTitle),
    changePasswordTitle: intl.formatMessage(messages.changePasswordTitle),
    removeWalletTitle: intl.formatMessage(messages.removeWalletTitle),
    termsOfServiceTitle: intl.formatMessage(messages.termsOfServiceTitle),
    changeWalletNameTitle: intl.formatMessage(messages.changeWalletNameTitle),
    supportTitle: intl.formatMessage(messages.supportTitle),
    toggleEachConfirmationTitle: intl.formatMessage(messages.toggleEachConfirmationTitle),
    customPinTitle: intl.formatMessage(messages.customPinTitle),
    settingsTitle: intl.formatMessage(messages.settingsTitle),
  }
}
