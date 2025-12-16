import {atoms as a, useTheme} from '@yoroi/theme'

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'
import {TouchableOpacity} from 'react-native'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {ChangePinScreen} from '~/features/Auth/ui/screens/ChangePinScreen'
import {EnableLoginWithPinScreen} from '~/features/Auth/ui/screens/EnableLoginWithPinScreen'
import {ReadPrivacyPolicyScreen} from '~/features/Legal/ui/screens/ReadPrivacyPolicyScreen'
import {ReadTermsOfServiceScreen} from '~/features/Legal/ui/screens/ReadTermsOfServiceScreen'
import {PreparingWalletScreen} from '~/features/SetupWallet/common/PreparingWalletScreen/PreparingWalletScreen'
import {MultisigWalletDetailsScreen} from '~/features/WalletManager/ui/screens/MultisigWalletDetailsScreen/MultisigWalletDetailsScreen'
import {useStrings} from '~/kernel/i18n/useStrings'
import {
  defaultMaterialTopTabNavigationOptions,
  defaultStackNavigationOptions,
} from '~/kernel/navigation/common/helpers'
import {SettingsStackRoutes, SettingsTabRoutes} from '~/kernel/navigation/types'
import {Icon} from '~/ui/Icon'

import {useOpenNetworkNoticeModal} from '../../hooks/useOpenNetworkNoticeModal'
import {AboutScreen} from '../screens/ChangeApplicationSettingsScreen/AboutScreen/AboutScreen'
import {ApplicationSettingsScreen} from '../screens/ChangeApplicationSettingsScreen/ApplicationSettingsScreen'
import {ListSystemLogsScreen} from '../screens/ChangeApplicationSettingsScreen/ListSystemLogsScreen/ListSystemLogsScreen'
import {PreparingNetworkScreen} from '../screens/ChangeApplicationSettingsScreen/PreparingNetworkScreen/PreparingNetworkScreen'
import {SelectCurrencySymbolScreen} from '../screens/ChangeApplicationSettingsScreen/SelectCurrencySymbolScreen/SelectCurrencySymbolScreen'
import {SelectLanguageScreen} from '../screens/ChangeApplicationSettingsScreen/SelectLanguageScreen/SelectLanguageScreen'
import {SelectNetworkScreen} from '../screens/ChangeApplicationSettingsScreen/SelectNetworkScreen/SelectNetworkScreen'
import {SelectThemeScreen} from '../screens/ChangeApplicationSettingsScreen/SelectThemeScreen/SelectThemeScreen'
import {ToggleAnalyticsSettingsScreen} from '../screens/ChangeApplicationSettingsScreen/ToggleAnalyticsSettings/ToggleAnalyticsSettingsScreen'
import {AdvancedAddressRetrievalScreen} from '../screens/ChangeWalletSettingsScreen/AdvancedAddressRetrievalScreen/AdvancedAddressRetrievalScreen'
import {ChangePasswordScreen} from '../screens/ChangeWalletSettingsScreen/ChangePasswordScreen/ChangePasswordScreen'
import {ChangeWalletSettingsScreen} from '../screens/ChangeWalletSettingsScreen/ChangeWalletSettingsScreen'
import {EnableEasyConfirmationScreen} from '../screens/ChangeWalletSettingsScreen/EnableEasyConfirmationScreen/EnableEasyConfirmationScreen'
import {ManageCollateralScreen} from '../screens/ChangeWalletSettingsScreen/ManageCollateralScreen/ManageCollateralScreen'
import {RemoveWalletScreen} from '../screens/ChangeWalletSettingsScreen/RemoveWallet/RemoveWalletScreen'
import {RenameWalletScreen} from '../screens/ChangeWalletSettingsScreen/RenameWalletScreen/RenameWalletScreen'
import {ShareWalletScreen} from '../screens/ShareWalletScreen/ShareWalletScreen'
import {NetworkTag} from '../shared/NetworkTag'
import {ManageNotificationsNavigator} from './ManageNotificationsNavigator'

const Stack = createStackNavigator<SettingsStackRoutes>()
export const SettingsScreenNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const openNetworkNoticeModal = useOpenNetworkNoticeModal()
  const openNetworkNoticeModalRef = React.useRef(openNetworkNoticeModal)
  openNetworkNoticeModalRef.current = openNetworkNoticeModal
  const handleOpenModal = React.useCallback(() => {
    openNetworkNoticeModalRef.current()
  }, [openNetworkNoticeModalRef])

  const navOptions = React.useMemo(() => defaultStackNavigationOptions(p), [p])

  return (
    <Stack.Navigator
      screenOptions={navOptions}
      initialRouteName="main-settings"
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
        getComponent={() => ListSystemLogsScreen}
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
        getComponent={() => ReadTermsOfServiceScreen}
        options={{title: strings.settings.termsOfServiceTitle}}
      />

      <Stack.Screen
        name="privacy-policy"
        getComponent={() => ReadPrivacyPolicyScreen}
        options={{title: strings.settings.privacyPolicyTitle}}
      />

      <Stack.Screen //
        name="remove-wallet"
        getComponent={() => RemoveWalletScreen}
        options={{title: strings.settings.removeWalletTitle}}
      />

      <Stack.Screen //
        name="change-language"
        getComponent={() => SelectLanguageScreen}
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
        getComponent={() => SelectThemeScreen}
        options={{
          title: strings.settings.themeTitle,
        }}
      />

      <Stack.Screen //
        name="change-network"
        getComponent={() => SelectNetworkScreen}
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
        options={{title: strings.auth.pinInputTitle}}
        getComponent={() => EnableLoginWithPinWrapper}
      />

      <Stack.Screen //
        name="settings-preparing-wallet"
        getComponent={() => PreparingWalletScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen //
        name="share-wallet"
        getComponent={() => ShareWalletScreen}
        options={{title: strings.settings.shareWallet.title}}
      />

      <Stack.Screen //
        name="multisig-wallet-details"
        getComponent={() => MultisigWalletDetailsScreen}
        options={{title: 'Multisig Wallet Details'}}
      />

      <Stack.Screen
        name="analytics"
        getComponent={() => ToggleAnalyticsSettingsScreen}
        options={{
          title: strings.settings.toggleAnalytics.toggleAnalyticsSettingsTitle,
        }}
      />

      <Stack.Screen
        name="advanced-address-retrieval"
        getComponent={() => AdvancedAddressRetrievalScreen}
        options={{
          title: strings.settings.advancedAddressRetrieval.title,
        }}
      />
    </Stack.Navigator>
  )
}

const Tab = createMaterialTopTabNavigator<SettingsTabRoutes>()
const SettingsTabNavigator = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  // Memoize screenOptions to prevent recreation on every render
  const screenOptions = React.useCallback(
    ({route}: {route: {name: string}}) => ({
      ...defaultMaterialTopTabNavigationOptions(p),
      tabBarLabel:
        route.name === 'wallet-settings'
          ? strings.settings.walletTabTitle
          : strings.settings.appTabTitle,
    }),
    [p, strings.settings.walletTabTitle, strings.settings.appTabTitle],
  )

  return (
    <Tab.Navigator style={ta.bg_color_max} screenOptions={screenOptions}>
      <Tab.Screen
        name="wallet-settings"
        getComponent={() => ChangeWalletSettingsScreen}
      />

      <Tab.Screen
        name="app-settings"
        getComponent={() => ApplicationSettingsScreen}
      />
    </Tab.Navigator>
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
