import {useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {CatalystNavigator} from '~/features/RegisterCatalyst/CatalystNavigator'
import {ReviewTxNavigator} from '~/features/ReviewTx/ReviewTxNavigator'
import {SearchProvider} from '~/features/Search/SearchContext'
import {SettingsScreenNavigator} from '~/features/Settings/SettingsScreenNavigator'
import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {SetupWalletNavigator} from '~/features/SetupWallet/SetupWalletNavigator'
import {SelectWalletFromList} from '~/features/WalletManager/ui/screens/SelectWalletFromListScreen/SelectWalletFromListScreen'
import {useStrings} from '~/kernel/i18n/useStrings'
import {WalletTabNavigator} from '~/kernel/navigation/WalletTabNavigator'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {WalletStackRoutes} from '~/kernel/navigation/types'

import {DashboardNavigator} from '../../features/Dashboard/DashboardNavigator'
import {GovernanceNavigator} from '../../features/Staking/Governance/GovernanceNavigator'

const Stack = createStackNavigator<WalletStackRoutes>()

export const WalletNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const navOptions = React.useMemo(() => defaultStackNavigationOptions(p), [p])

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
    </SearchProvider>
  )
}
