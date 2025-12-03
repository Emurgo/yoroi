import {useTheme} from '@yoroi/theme'

import {
  StackNavigationOptions,
  createStackNavigator,
} from '@react-navigation/stack'
import * as React from 'react'

import {DashboardNavigator} from '~/features/Dashboard/ui/navigation/DashboardNavigator'
import {CatalystNavigator} from '~/features/RegisterCatalyst/CatalystNavigator'
import {ReviewTxNavigator} from '~/features/ReviewTx/ReviewTxNavigator'
import {SettingsScreenNavigator} from '~/features/Settings/ui/navigation/SettingsScreenNavigator'
import {NetworkTag} from '~/features/Settings/ui/shared/NetworkTag'
import {SetupWalletNavigator} from '~/features/SetupWallet/SetupWalletNavigator'
import {GovernanceNavigator} from '~/features/Staking/Governance/GovernanceNavigator'
import {SelectWalletFromList} from '~/features/WalletManager/ui/screens/SelectWalletFromListScreen/SelectWalletFromListScreen'
import {useStrings} from '~/kernel/i18n/useStrings'
import {WalletTabNavigator} from '~/kernel/navigation/WalletTabNavigator'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {WalletStackRoutes} from '~/kernel/navigation/types'

const Stack = createStackNavigator<WalletStackRoutes>()

export const WalletNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const navOptions = React.useMemo(
    () => ({...defaultStackNavigationOptions(p), headerLeft: undefined}),
    [p],
  )

  // Memoize headerTitle component to prevent recreation on every render
  const headerTitle = React.useCallback(
    ({children}: {children: React.ReactNode}) => (
      <NetworkTag directChangeActive>{children}</NetworkTag>
    ),
    [],
  )

  const stackOptions: StackNavigationOptions = React.useMemo(
    () => ({
      title: strings.global.walletSelectionScreenHeader,
      headerTitle,
    }),
    [strings.global.walletSelectionScreenHeader, headerTitle],
  )

  return (
    <Stack.Navigator screenOptions={navOptions}>
      <Stack.Screen
        name="wallet-selection"
        options={stackOptions}
        getComponent={() => SelectWalletFromList}
      />

      <Stack.Screen //
        name="setup-wallet"
        options={{headerShown: false}}
        getComponent={() => SetupWalletNavigator}
      />

      <Stack.Screen
        name="main-wallet-routes"
        options={{headerShown: false}}
        getComponent={() => WalletTabNavigator}
      />

      <Stack.Screen
        name="review-tx-routes"
        options={{headerShown: false}}
        getComponent={() => ReviewTxNavigator}
      />

      <Stack.Screen
        name="settings"
        options={{headerShown: false}}
        getComponent={() => SettingsScreenNavigator}
      />

      <Stack.Screen
        name="staking-dashboard"
        options={{headerShown: false}}
        getComponent={() => DashboardNavigator}
      />

      <Stack.Screen
        name="governance"
        options={{headerShown: false}}
        getComponent={() => GovernanceNavigator}
      />
      <Stack.Screen
        name="voting-registration"
        options={{headerShown: false}}
        getComponent={() => CatalystNavigator}
      />
    </Stack.Navigator>
  )
}
