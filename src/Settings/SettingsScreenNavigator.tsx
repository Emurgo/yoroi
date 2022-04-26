import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {useDispatch} from 'react-redux'

import {ChangePinScreen, CreatePinScreen} from '../auth'
import {setEasyConfirmation, setSystemAuth} from '../legacy/actions'
import {defaultStackNavigationOptions, SettingsStackRoutes, SettingsTabRoutes, useWalletNavigation} from '../navigation'
import {useSelectedWalletMeta, useSetSelectedWalletMeta} from '../SelectedWallet'
import {COLORS} from '../theme'
import {walletManager} from '../yoroi-wallets'
import {ApplicationSettingsScreen} from './ApplicationSettings'
import {BiometricsLinkScreen} from './BiometricsLink/'
import {ChangeLanguageScreen} from './ChangeLanguage'
import {ChangePasswordScreen} from './ChangePassword'
import {ChangeWalletName} from './ChangeWalletName'
import {RemoveWalletScreen} from './RemoveWallet'
import {SupportScreen} from './Support'
import {TermsOfServiceScreen} from './TermsOfService'
import {ToggleEasyConfirmationScreen} from './ToggleEasyConfirmation'
import {WalletSettingsScreen} from './WalletSettings'

const Stack = createStackNavigator<SettingsStackRoutes>()
export const SettingsScreenNavigator = () => {
  const strings = useStrings()
  const navigation = useNavigation()
  const {navigateToSettings} = useWalletNavigation()
  const dispatch = useDispatch()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const walletMeta = useSelectedWalletMeta()

  return (
    <Stack.Navigator screenOptions={defaultStackNavigationOptions} initialRouteName="settings-main">
      <Stack.Screen //
        name="settings-main"
        component={SettingsTabNavigator}
        options={{title: strings.settingsTitle}}
      />

      <Stack.Screen
        name="change-wallet-name"
        component={ChangeWalletName}
        options={{title: strings.changeWalletNameTitle}}
      />

      <Stack.Screen
        name="terms-of-use"
        component={TermsOfServiceScreen}
        options={{title: strings.termsOfServiceTitle}}
      />

      <Stack.Screen //
        name="support"
        component={SupportScreen}
        options={{title: strings.supportTitle}}
      />

      <Stack.Screen //
        name="fingerprint-link"
        component={BiometricsLinkScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen //
        name="remove-wallet"
        component={RemoveWalletScreen}
        options={{title: strings.removeWalletTitle}}
      />

      <Stack.Screen //
        name="change-language"
        component={ChangeLanguageScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen //
        name="easy-confirmation"
        component={ToggleEasyConfirmationScreen}
        options={{title: strings.toggleEachConfirmationTitle}}
      />

      <Stack.Screen //
        name="change-password"
        component={ChangePasswordScreen}
        options={{title: strings.changePasswordTitle}}
      />

      <Stack.Screen //
        name="change-custom-pin"
        options={{
          title: strings.changeCustomPinTitle,
          headerStyle: defaultStackNavigationOptions.headerStyle,
        }}
      >
        {() => <ChangePinScreen onDone={() => navigation.goBack()} />}
      </Stack.Screen>

      <Stack.Screen //
        name="setup-custom-pin"
        options={{title: strings.customPinTitle}}
      >
        {() => (
          <CreatePinScreen
            onDone={async () => {
              await dispatch(setSystemAuth(false))
              await walletManager.disableEasyConfirmation()
              dispatch(setEasyConfirmation(false))
              if (!walletMeta) throw new Error('No wallet meta')
              setSelectedWalletMeta({
                ...walletMeta,
                isEasyConfirmationEnabled: false,
              })
              navigateToSettings()
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

const Tab = createMaterialTopTabNavigator<SettingsTabRoutes>()
const SettingsTabNavigator = () => {
  const strings = useStrings()

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarLabel: route.name === 'wallet-settings' ? strings.walletTabTitle : strings.appTabTitle,
        tabBarStyle: {backgroundColor: COLORS.BACKGROUND_BLUE, elevation: 0, shadowOpacity: 0},
        tabBarIndicatorStyle: {backgroundColor: '#fff', height: 2},
        tabBarLabelStyle: {color: COLORS.WHITE},
      })}
    >
      <Tab.Screen name="wallet-settings" component={WalletSettingsScreen} />
      <Tab.Screen name="app-settings" component={ApplicationSettingsScreen} />
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
