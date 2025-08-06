import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {TouchableOpacity} from 'react-native'

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
        component={ApplicationSettingsScreen}
        options={{
          title: strings.settings.appSettingsTitle,
        }}
      />

      <Stack.Screen
        name="about"
        component={About}
        options={{title: strings.settings.aboutTitle}}
      />

      <Stack.Screen
        name="settings-system-log"
        component={SystemLogScreen}
        options={{title: strings.settings.systemLogTitle}}
      />

      <Stack.Screen //
        name="main-settings"
        component={SettingsTabNavigator}
        options={{
          title: strings.settings.settingsTitle,
          headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
        }}
      />

      <Stack.Screen
        name="change-wallet-name"
        component={RenameWalletScreen}
        options={{title: strings.settings.changeWalletNameTitle}}
      />

      <Stack.Screen
        name="terms-of-use"
        component={TermsOfServiceScreen}
        options={{title: strings.settings.termsOfServiceTitle}}
      />

      <Stack.Screen
        name="privacy-policy"
        component={PrivacyPolicyScreen}
        options={{title: strings.settings.privacyPolicyTitle}}
      />

      <Stack.Screen //
        name="enable-login-with-os"
        component={EnableLoginWithOsScreenWrapper}
        options={{headerShown: false}}
      />

      <Stack.Screen //
        name="remove-wallet"
        component={RemoveWalletScreen}
        options={{title: strings.settings.removeWalletTitle}}
      />

      <Stack.Screen //
        name="change-language"
        component={ChangeLanguageScreen}
        options={{title: strings.settings.languageTitle}}
      />

      <Stack.Screen //
        name="change-currency"
        component={ChangeCurrencyScreen}
        options={{
          title: strings.settings.currency,
        }}
      />

      <Stack.Screen //
        name="change-theme"
        component={ChangeThemeScreen}
        options={{
          title: strings.settings.themeTitle,
        }}
      />

      <Stack.Screen //
        name="change-network"
        component={ChangeNetworkScreen}
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
        component={PreparingNetworkScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen //
        name="enable-easy-confirmation"
        component={EnableEasyConfirmationScreen}
        options={{title: strings.settings.enableEasyConfirmationTitle}}
      />

      <Stack.Screen //
        name="disable-easy-confirmation"
        component={DisableEasyConfirmationScreen}
        options={{title: strings.settings.disableEasyConfirmationTitle}}
      />

      <Stack.Screen //
        name="change-password"
        component={ChangePasswordScreen}
        options={{title: strings.settings.changePasswordTitle}}
      />

      <Stack.Screen //
        name="change-custom-pin"
        options={{
          title: strings.settings.changeCustomPinTitle,
        }}
        component={ChangePinScreenWrapper}
      />

      <Stack.Screen //
        name="manage-collateral"
        options={{
          title: strings.settings.collateral,
        }}
        component={ManageCollateralScreen}
      />

      <Stack.Screen //
        name="manage-notifications"
        options={{headerShown: false}}
        component={ManageNotificationsNavigator}
      />

      <Stack.Screen
        name="enable-login-with-pin"
        options={{title: strings.settings.customPinTitle}}
        component={EnableLoginWithPinWrapper}
      />

      <Stack.Screen //
        name="settings-preparing-wallet"
        component={PreparingWalletScreen}
        options={{headerShown: false}}
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

  return <EnableLoginWithPinScreen onDone={navigation.goBack} />
}
