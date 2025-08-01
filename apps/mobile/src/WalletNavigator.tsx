import {createStackNavigator} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'

import {SearchProvider} from '~/features/Search/SearchContext'
import {SettingsScreenNavigator} from '~/features/Settings/SettingsScreenNavigator'
import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {SetupWalletNavigator} from '~/features/SetupWallet/SetupWalletNavigator'
import {SelectWalletFromList} from '~/features/WalletManager/screens/SelectWalletFromListScreen/SelectWalletFromListScreen'
import {useStrings} from '~/kernel/i18n/useStrings'
import {
  defaultStackNavigationOptions,
  WalletStackRoutes,
} from '~/kernel/navigation/navigation'
import {WalletTabNavigator} from '~/kernel/navigation/WalletTabNavigator'

const Stack = createStackNavigator<WalletStackRoutes>()

export const WalletNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const navOptions = React.useMemo(
    () => defaultStackNavigationOptions(a, p),
    [p],
  )

  return (
    <SearchProvider>
      <Stack.Navigator
        screenOptions={{
          ...navOptions,
          headerLeft: undefined,
        }}
      >
        <Stack.Screen
          name="wallet-selection"
          options={{
            title: strings.global.walletSelectionScreenHeader,
            headerTitle: ({children}) => (
              <NetworkTag directChangeActive>{children}</NetworkTag>
            ),
          }}
          component={SelectWalletFromList}
        />

        <Stack.Screen //
          name="setup-wallet"
          options={{headerShown: false}}
          component={SetupWalletNavigator}
        />

        <Stack.Screen
          name="main-wallet-routes"
          options={{headerShown: false}}
          component={WalletTabNavigator}
        />

        <Stack.Screen
          name="settings"
          options={{headerShown: false}}
          component={SettingsScreenNavigator}
        />
      </Stack.Navigator>
    </SearchProvider>
  )
}

// Main wallet routes now handled by WalletTabNavigator
