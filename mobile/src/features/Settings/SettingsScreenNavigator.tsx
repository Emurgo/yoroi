import {atoms as a, useTheme} from '@yoroi/theme'

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'
import {TouchableOpacity} from 'react-native'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {
  defaultMaterialTopTabNavigationOptions,
  defaultStackNavigationOptions,
} from '~/kernel/navigation/common/helpers'
import {SettingsStackRoutes, SettingsTabRoutes} from '~/kernel/navigation/types'
import {Boundary} from '~/ui/Boundary/Boundary'
import {Icon} from '~/ui/Icon'

import {ChangePinScreen} from '../Auth/ui/screens/ChangePinScreen'
import {EnableLoginWithPinScreen} from '../Auth/ui/screens/EnableLoginWithPinScreen'
import {PreparingWalletScreen} from '../SetupWallet/common/PreparingWalletScreen/PreparingWalletScreen'
import {AboutScreen} from './ui/screens/ChangeApplicationSettingsScreen/AboutScreen/AboutScreen'
import {ApplicationSettingsScreen} from './ui/screens/ChangeApplicationSettingsScreen/ApplicationSettingsScreen'
import {ChangeLanguageScreen} from './ui/screens/ChangeApplicationSettingsScreen/ChangeLanguageScreen/ChangeLanguageScreen'
import {
  ChangeNetworkScreen,
  useHandleOpenNetworkNoticeModal,
} from './ui/screens/ChangeApplicationSettingsScreen/ChangeNetwork/ChangeNetworkScreen'
import {ChangeThemeScreen} from './ui/screens/ChangeApplicationSettingsScreen/ChangeNetwork/ChangeTheme/ChangeThemeScreen'
import {NetworkTag} from './ui/screens/ChangeApplicationSettingsScreen/ChangeNetwork/NetworkTag'
import {PreparingNetworkScreen} from './ui/screens/ChangeApplicationSettingsScreen/ChangeNetwork/PreparingNetworkScreen'
import {EnableLoginWithOsScreen} from './ui/screens/ChangeApplicationSettingsScreen/EnableLoginWithOs/EnableLoginWithOsScreen'
import {PrivacyPolicyScreen} from './ui/screens/ChangeApplicationSettingsScreen/PrivacyPolicy/PrivacyPolicyScreen'
import {SelectCurrencySymbolScreen} from './ui/screens/ChangeApplicationSettingsScreen/SelectCurrencySymbolScreen/SelectCurrencySymbolScreen'
import {SystemLogScreen} from './ui/screens/ChangeApplicationSettingsScreen/SystemLogScreen/SystemLogScreen'
import {TermsOfServiceScreen} from './ui/screens/ChangeApplicationSettingsScreen/TermsOfService/TermsOfServiceScreen'
import {ToggleAnalyticsSettingsScreen} from './ui/screens/ChangeApplicationSettingsScreen/ToggleAnalyticsSettings/ToggleAnalyticsSettingsScreen'
import {ChangePasswordScreen} from './useCases/changeWalletSettings/ChangePassword'
import {
  DisableEasyConfirmationScreen,
  EnableEasyConfirmationScreen,
} from './useCases/changeWalletSettings/EasyConfirmation'
import {ManageCollateralScreen} from './useCases/changeWalletSettings/ManageCollateral'
import {ManageNotificationsNavigator} from './useCases/changeWalletSettings/ManageNotifications/ManageNotificationsNavigator'
import {RemoveWalletScreen} from './useCases/changeWalletSettings/RemoveWallet'
import {RenameWalletScreen} from './useCases/changeWalletSettings/RenameWalletScreen/RenameWalletScreen'
import {WalletSettingsScreen} from './useCases/changeWalletSettings/WalletSettingsScreen'

const Stack = createStackNavigator<SettingsStackRoutes>()
export const SettingsScreenNavigator = () => {
  const strings = useStrings()
  const {track} = useMetrics()
  const {palette: p} = useTheme()
  const {handleOpenModal} = useHandleOpenNetworkNoticeModal()

  useFocusEffect(
    React.useCallback(() => {
      track.settingsPageViewed()
    }, [track]),
  )

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions(p),
      }}
    >
      <Stack.Screen //
        name="app-settings"
        getComponent={() => ApplicationSettingsScreen}
        options={{
          title: strings.settings.appSettingsTitle,
        }}
      />

      <Stack.Screen
        name="about"
        getComponent={() => AboutScreen}
        options={{title: strings.settings.aboutTitle}}
      />

      <Stack.Screen
        name="settings-system-log"
        getComponent={() => SystemLogScreen}
        options={{title: strings.settings.systemLogTitle}}
      />

      <Stack.Screen //
        name="main-settings"
        getComponent={() => SettingsTabNavigator}
        options={{
          title: strings.settings.settingsTitle,
          headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
        }}
      />

      <Stack.Screen
        name="change-wallet-name"
        getComponent={() => RenameWalletScreen}
        options={{title: strings.settings.changeWalletNameTitle}}
      />

      <Stack.Screen
        name="terms-of-use"
        getComponent={() => TermsOfServiceScreen}
        options={{title: strings.settings.termsOfServiceTitle}}
      />

      <Stack.Screen
        name="privacy-policy"
        getComponent={() => PrivacyPolicyScreen}
        options={{title: strings.settings.privacyPolicyTitle}}
      />

      <Stack.Screen //
        name="enable-login-with-os"
        getComponent={() => EnableLoginWithOsScreenWrapper}
        options={{headerShown: false}}
      />

      <Stack.Screen //
        name="remove-wallet"
        getComponent={() => RemoveWalletScreen}
        options={{title: strings.settings.removeWalletTitle}}
      />

      <Stack.Screen //
        name="change-language"
        getComponent={() => ChangeLanguageScreen}
        options={{title: strings.settings.languageTitle}}
      />

      <Stack.Screen //
        name="change-currency"
        getComponent={() => SelectCurrencySymbolScreen}
        options={{
          title: strings.settings.currency,
        }}
      />

      <Stack.Screen //
        name="change-theme"
        getComponent={() => ChangeThemeScreen}
        options={{
          title: strings.settings.themeTitle,
        }}
      />

      <Stack.Screen //
        name="change-network"
        getComponent={() => ChangeNetworkScreen}
        options={{
          title: strings.settings.networkTitle,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleOpenModal}
              activeOpacity={0.5}
              style={a.px_lg}
            >
              <Icon.Info size={24} color={p.gray_900} />
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen //
        name="preparing-network"
        getComponent={() => PreparingNetworkScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen //
        name="enable-easy-confirmation"
        getComponent={() => EnableEasyConfirmationScreen}
        options={{title: strings.settings.enableEasyConfirmationTitle}}
      />

      <Stack.Screen //
        name="disable-easy-confirmation"
        getComponent={() => DisableEasyConfirmationScreen}
        options={{title: strings.settings.disableEasyConfirmationTitle}}
      />

      <Stack.Screen //
        name="change-password"
        getComponent={() => ChangePasswordScreen}
        options={{title: strings.settings.changePasswordTitle}}
      />

      <Stack.Screen //
        name="change-custom-pin"
        getComponent={() => ChangePinScreenWrapper}
        options={{
          title: strings.settings.changeCustomPinTitle,
        }}
      />

      <Stack.Screen //
        name="manage-collateral"
        getComponent={() => ManageCollateralScreen}
        options={{
          title: strings.settings.collateral,
        }}
      />

      <Stack.Screen //
        name="manage-notifications"
        getComponent={() => ManageNotificationsNavigator}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="enable-login-with-pin"
        options={{title: strings.settings.customPinTitle}}
        getComponent={() => EnableLoginWithPinWrapper}
      />

      <Stack.Screen //
        name="settings-preparing-wallet"
        getComponent={() => PreparingWalletScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="analytics"
        getComponent={() => ToggleAnalyticsSettingsScreen}
        options={{
          title: strings.settings.toggleAnalytics.toggleAnalyticsSettingsTitle,
        }}
      />
    </Stack.Navigator>
  )
}

const Tab = createMaterialTopTabNavigator<SettingsTabRoutes>()
const SettingsTabNavigator = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  return (
    <Tab.Navigator
      style={ta.bg_color_max}
      screenOptions={({route}) => ({
        ...defaultMaterialTopTabNavigationOptions(p),
        tabBarLabel:
          route.name === 'wallet-settings'
            ? strings.settings.walletTabTitle
            : strings.settings.appTabTitle,
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
  const {changeAuthSetting} = useAuth()

  const handleDone = () => {
    changeAuthSetting('pin')
    navigation.goBack()
  }

  return <EnableLoginWithPinScreen onDone={handleDone} />
}
