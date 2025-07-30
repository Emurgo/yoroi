import {useFocusEffect} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {DiscoverNavigator} from '~/features/Discover'
import {MenuNavigator} from '~/features/Menu/Menu'
import {PortfolioNavigator} from '~/features/Portfolio/PortfolioNavigator'
import {SearchProvider} from '~/features/Search/SearchContext'
import {SettingsScreenNavigator} from '~/features/Settings/SettingsScreenNavigator'
import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {SetupWalletNavigator} from '~/features/SetupWallet/SetupWalletNavigator'
import {TxHistoryNavigator} from '~/features/Transactions/TxHistoryNavigator'
import {SelectWalletFromList} from '~/features/WalletManager/screens/SelectWalletFromListScreen/SelectWalletFromListScreen'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {
  defaultStackNavigationOptions,
  WalletStackRoutes,
} from '~/kernel/navigation/navigation'

const Stack = createStackNavigator<WalletStackRoutes>()

export const WalletNavigator = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

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
            title: strings.walletSelectionScreenHeader,
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
          component={MainWalletRoutes}
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

// Simple component to show main wallet routes
const MainWalletRoutes = () => {
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.walletPageViewed()
    }, [track]),
  )

  return (
    <SearchProvider>
      <TxHistoryNavigator />
    </SearchProvider>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    walletSelectionScreenHeader: intl.formatMessage(
      messages.walletSelectionScreenHeader,
    ),
  }
}

const messages = defineMessages({
  walletSelectionScreenHeader: {
    id: 'global.walletSelectionScreenHeader',
    defaultMessage: '!!!Select Wallet',
  },
})
