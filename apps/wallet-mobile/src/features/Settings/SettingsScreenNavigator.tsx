import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import {TransferProvider} from '@yoroi/transfer'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {ChangePinScreen} from '../../auth'
import {EnableLoginWithPin} from '../../auth/EnableLoginWithPin'
import {Boundary} from '../../components'
import globalMessages from '../../i18n/global-messages'
import {useMetrics} from '../../metrics/metricsManager'
import {
  defaultMaterialTopTabNavigationOptions,
  defaultStackNavigationOptions,
  SettingsStackRoutes,
  SettingsTabRoutes,
} from '../../navigation'
import {useSelectedWallet} from '../WalletManager/Context'
import {About} from './About'
import {ApplicationSettingsScreen} from './ApplicationSettings'
import {ChangeLanguageScreen} from './ChangeLanguage'
import {ChangePasswordScreen} from './ChangePassword'
import {ChangeWalletName} from './ChangeWalletName'
import {ChangeCurrencyScreen} from './Currency/ChangeCurrencyScreen'
import {DisableEasyConfirmationScreen, EnableEasyConfirmationScreen} from './EasyConfirmation'
import {EnableLoginWithOsScreen} from './EnableLoginWithOs'
import {ManageCollateralScreen} from './ManageCollateral'
import {ConfirmTxScreen} from './ManageCollateral/ConfirmTx'
import {FailedTxScreen} from './ManageCollateral/ConfirmTx/FailedTx/FailedTxScreen'
import {SubmittedTxScreen} from './ManageCollateral/ConfirmTx/SubmittedTx/SubmittedTxScreen'
import {PrivacyPolicyScreen} from './PrivacyPolicy'
import {RemoveWalletScreen} from './RemoveWallet'
import {TermsOfServiceScreen} from './TermsOfService'
import {WalletSettingsScreen} from './WalletSettings'

const Stack = createStackNavigator<SettingsStackRoutes>()
export const SettingsScreenNavigator = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {track} = useMetrics()
  const {atoms, color} = useTheme()

  useFocusEffect(
    React.useCallback(() => {
      track.settingsPageViewed()
    }, [track]),
  )

  return (
    <TransferProvider key={wallet.id}>
      <Stack.Navigator
        screenOptions={{
          ...defaultStackNavigationOptions(atoms, color),
          detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
        }}
      >
        <Stack.Screen //
          name="app-settings"
          component={ApplicationSettingsScreen}
          options={{title: strings.appSettingsTitle}}
        />

        <Stack.Screen name="about" component={About} options={{title: strings.aboutTitle}} />

        <Stack.Screen //
          name="main-settings"
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

        <Stack.Screen
          name="privacy-policy"
          component={PrivacyPolicyScreen}
          options={{title: strings.privacyPolicyTitle}}
        />

        <Stack.Screen //
          name="enable-login-with-os"
          component={EnableLoginWithOsScreenWrapper}
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
          options={{title: strings.languageTitle}}
        />

        <Stack.Screen //
          name="change-currency"
          component={ChangeCurrencyScreen}
          options={{
            title: strings.currency,
          }}
        />

        <Stack.Screen //
          name="enable-easy-confirmation"
          component={EnableEasyConfirmationScreen}
          options={{title: strings.enableEasyConfirmationTitle}}
        />

        <Stack.Screen //
          name="disable-easy-confirmation"
          component={DisableEasyConfirmationScreen}
          options={{title: strings.disableEasyConfirmationTitle}}
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
          }}
          component={ChangePinScreenWrapper}
        />

        <Stack.Screen //
          name="manage-collateral"
          options={{
            title: strings.collateral,
          }}
          component={ManageCollateralScreen}
        />

        <Stack.Screen //
          name="collateral-confirm-tx"
          options={{
            title: strings.collateral,
          }}
          component={ConfirmTxScreen}
        />

        <Stack.Screen //
          name="collateral-tx-submitted"
          options={{
            title: strings.collateral,
            headerLeft: () => null,
          }}
          component={SubmittedTxScreen}
        />

        <Stack.Screen //
          name="collateral-tx-failed"
          options={{
            title: strings.collateral,
          }}
          component={FailedTxScreen}
        />

        <Stack.Screen
          name="enable-login-with-pin"
          options={{title: strings.customPinTitle}}
          component={EnableLoginWithPinWrapper}
        />
      </Stack.Navigator>
    </TransferProvider>
  )
}

const Tab = createMaterialTopTabNavigator<SettingsTabRoutes>()
const SettingsTabNavigator = () => {
  const strings = useStrings()
  const {color, atoms} = useTheme()

  return (
    <Tab.Navigator
      style={{backgroundColor: color.gray_cmin}}
      screenOptions={({route}) => ({
        ...defaultMaterialTopTabNavigationOptions(atoms, color),
        tabBarLabel: route.name === 'wallet-settings' ? strings.walletTabTitle : strings.appTabTitle,
      })}
    >
      <Tab.Screen name="wallet-settings" component={WalletSettingsScreen} />

      <Tab.Screen name="app-settings" component={ApplicationSettingsScreen} />
    </Tab.Navigator>
  )
}

const EnableLoginWithOsScreenWrapper = () => {
  return (
    <Boundary>
      <EnableLoginWithOsScreen />
    </Boundary>
  )
}

const ChangePinScreenWrapper = () => {
  const navigation = useNavigation()

  return <ChangePinScreen onDone={navigation.goBack} />
}

const EnableLoginWithPinWrapper = () => {
  const navigation = useNavigation()

  return <EnableLoginWithPin onDone={navigation.goBack} />
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
  enableEasyConfirmationTitle: {
    id: 'components.settings.enableeasyconfirmationscreen.title',
    defaultMessage: '!!!Easy confirmation',
  },
  disableEasyConfirmationTitle: {
    id: 'components.settings.disableeasyconfirmationscreen.title',
    defaultMessage: '!!!Easy confirmation',
  },
  customPinTitle: {
    id: 'components.initialization.custompinscreen.title',
    defaultMessage: '!!!Set PIN',
  },
  settingsTitle: {
    id: 'components.settings.applicationsettingsscreen.title',
    defaultMessage: '!!!Settings',
  },
  languageTitle: {
    id: 'components.settings.changelanguagescreen.title',
    defaultMessage: '!!!Language',
  },
  appSettingsTitle: {
    id: 'components.settings.applicationsettingsscreen.appSettingsTitle',
    defaultMessage: '!!!App settings',
  },
  aboutTitle: {
    id: 'components.settings.applicationsettingsscreen.about',
    defaultMessage: '!!!About',
  },
  privacyPolicyTitle: {
    id: 'components.settings.privacypolicyscreen.title',
    defaultMessage: '!!!Privacy Policy',
  },
  collateral: {
    id: 'global.collateral',
    defaultMessage: '!!!Collateral',
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
    enableEasyConfirmationTitle: intl.formatMessage(messages.enableEasyConfirmationTitle),
    disableEasyConfirmationTitle: intl.formatMessage(messages.disableEasyConfirmationTitle),
    customPinTitle: intl.formatMessage(messages.customPinTitle),
    settingsTitle: intl.formatMessage(messages.settingsTitle),
    languageTitle: intl.formatMessage(messages.languageTitle),
    currency: intl.formatMessage(globalMessages.currency),
    aboutTitle: intl.formatMessage(messages.aboutTitle),
    appSettingsTitle: intl.formatMessage(messages.appSettingsTitle),
    privacyPolicyTitle: intl.formatMessage(messages.privacyPolicyTitle),
    collateral: intl.formatMessage(messages.collateral),
  }
}
