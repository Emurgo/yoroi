import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {TouchableOpacity} from 'react-native'

import {Boundary} from '../../components/Boundary/Boundary'
import {Icon} from '../../components/Icon'
import globalMessages from '../../kernel/i18n/global-messages'
import {useMetrics} from '../../kernel/metrics/metricsManager'
import {
  defaultMaterialTopTabNavigationOptions,
  defaultStackNavigationOptions,
  SettingsStackRoutes,
  SettingsTabRoutes,
} from '../../kernel/navigation'
import {ChangePinScreen} from '../Auth/ChangePinScreen'
import {EnableLoginWithPin} from '../Auth/EnableLoginWithPin'
import {About} from './useCases/changeAppSettings/About'
import {ApplicationSettingsScreen} from './useCases/changeAppSettings/ApplicationSettingsScreen'
import {ChangeLanguageScreen} from './useCases/changeAppSettings/ChangeLanguage'
import {
  ChangeNetworkScreen,
  useHandleOpenNetworkNoticeModal,
} from './useCases/changeAppSettings/ChangeNetwork/ChangeNetworkScreen'
import {NetworkTag} from './useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {PreparingNetworkScreen} from './useCases/changeAppSettings/ChangeNetwork/PreparingNetworkScreen'
import {ChangeThemeScreen} from './useCases/changeAppSettings/ChangeTheme/ChangeThemeScreen'
import {ChangeCurrencyScreen} from './useCases/changeAppSettings/Currency/ChangeCurrencyScreen'
import {EnableLoginWithOsScreen} from './useCases/changeAppSettings/EnableLoginWithOs'
import {PrivacyPolicyScreen} from './useCases/changeAppSettings/PrivacyPolicy'
import {SystemLogScreen} from './useCases/changeAppSettings/SystemLogScreen/SystemLogScreen'
import {TermsOfServiceScreen} from './useCases/changeAppSettings/TermsOfService'
import {ChangePasswordScreen} from './useCases/changeWalletSettings/ChangePassword'
import {
  DisableEasyConfirmationScreen,
  EnableEasyConfirmationScreen,
} from './useCases/changeWalletSettings/EasyConfirmation'
import {ManageCollateralScreen} from './useCases/changeWalletSettings/ManageCollateral'
import {FailedTxScreen} from './useCases/changeWalletSettings/ManageCollateral/ConfirmTx/FailedTx/FailedTxScreen'
import {SubmittedTxScreen} from './useCases/changeWalletSettings/ManageCollateral/ConfirmTx/SubmittedTx/SubmittedTxScreen'
import {RemoveWalletScreen} from './useCases/changeWalletSettings/RemoveWallet'
import {RenameWalletScreen} from './useCases/changeWalletSettings/RenameWalletScreen/RenameWalletScreen'
import {WalletSettingsScreen} from './useCases/changeWalletSettings/WalletSettingsScreen'

const Stack = createStackNavigator<SettingsStackRoutes>()
export const SettingsScreenNavigator = () => {
  const strings = useStrings()
  const {track} = useMetrics()
  const {atoms, color} = useTheme()
  const {handleOpenModal} = useHandleOpenNetworkNoticeModal()

  useFocusEffect(
    React.useCallback(() => {
      track.settingsPageViewed()
    }, [track]),
  )

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions(atoms, color),
      }}
    >
      <Stack.Screen //
        name="app-settings"
        component={ApplicationSettingsScreen}
        options={{
          title: strings.appSettingsTitle,
        }}
      />

      <Stack.Screen name="about" component={About} options={{title: strings.aboutTitle}} />

      <Stack.Screen name="settings-system-log" component={SystemLogScreen} options={{title: strings.systemLogTitle}} />

      <Stack.Screen //
        name="main-settings"
        component={SettingsTabNavigator}
        options={{
          title: strings.settingsTitle,
          headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
        }}
      />

      <Stack.Screen
        name="change-wallet-name"
        component={RenameWalletScreen}
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
        name="change-theme"
        component={ChangeThemeScreen}
        options={{
          title: strings.themeTitle,
        }}
      />

      <Stack.Screen //
        name="change-network"
        component={ChangeNetworkScreen}
        options={{
          title: strings.networkTitle,
          headerRight: () => (
            <TouchableOpacity onPress={handleOpenModal} activeOpacity={0.5}>
              <Icon.Info size={24} color={color.gray_900} style={{...atoms.px_lg}} />
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen //
        name="preparing-network"
        component={PreparingNetworkScreen}
        options={{
          headerShown: false,
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
  )
}

const Tab = createMaterialTopTabNavigator<SettingsTabRoutes>()
const SettingsTabNavigator = () => {
  const strings = useStrings()
  const {color, atoms} = useTheme()

  return (
    <Tab.Navigator
      style={{backgroundColor: color.bg_color_max}}
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
  themeTitle: {
    id: 'components.settings.changeThemescreen.title',
    defaultMessage: '!!!Theming',
  },
  networkTitle: {
    id: 'components.settings.changeNetworkScreen.title',
    defaultMessage: '!!!Network',
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
  systemLogTitle: {
    id: 'global.log',
    defaultMessage: '!!!Log',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    aboutTitle: intl.formatMessage(messages.aboutTitle),
    appSettingsTitle: intl.formatMessage(messages.appSettingsTitle),
    appTabTitle: intl.formatMessage(messages.appTabTitle),
    changeCustomPinTitle: intl.formatMessage(messages.changeCustomPinTitle),
    changePasswordTitle: intl.formatMessage(messages.changePasswordTitle),
    changeWalletNameTitle: intl.formatMessage(messages.changeWalletNameTitle),
    collateral: intl.formatMessage(messages.collateral),
    currency: intl.formatMessage(globalMessages.currency),
    customPinTitle: intl.formatMessage(messages.customPinTitle),
    disableEasyConfirmationTitle: intl.formatMessage(messages.disableEasyConfirmationTitle),
    enableEasyConfirmationTitle: intl.formatMessage(messages.enableEasyConfirmationTitle),
    languageTitle: intl.formatMessage(messages.languageTitle),
    systemLogTitle: intl.formatMessage(messages.systemLogTitle),
    privacyPolicyTitle: intl.formatMessage(messages.privacyPolicyTitle),
    removeWalletTitle: intl.formatMessage(messages.removeWalletTitle),
    settingsTitle: intl.formatMessage(messages.settingsTitle),
    supportTitle: intl.formatMessage(messages.supportTitle),
    termsOfServiceTitle: intl.formatMessage(messages.termsOfServiceTitle),
    themeTitle: intl.formatMessage(messages.themeTitle),
    walletTabTitle: intl.formatMessage(messages.walletTabTitle),
    networkTitle: intl.formatMessage(messages.networkTitle),
  }
}
