import {useFocusEffect} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Text, TouchableOpacity, View} from 'react-native'

// import {PortfolioNavigator} from '~/features/Portfolio/PortfolioNavigator'
import {SearchProvider} from '~/features/Search/SearchContext'
import {SettingsScreenNavigator} from '~/features/Settings/SettingsScreenNavigator'
import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {SetupWalletNavigator} from '~/features/SetupWallet/SetupWalletNavigator'
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

// Main wallet routes component that handles the different tabs
const MainWalletRoutes = () => {
  const {track} = useMetrics()
  const [currentView, setCurrentView] = React.useState<'history' | 'portfolio'>(
    'history',
  )
  const {palette: p} = useTheme()

  useFocusEffect(
    React.useCallback(() => {
      track.walletPageViewed()
    }, [track]),
  )

  return (
    <SearchProvider>
      <View style={{flex: 1}}>
        {/* Simple navigation tabs */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: p.bg_color_max,
            borderBottomWidth: 1,
            borderBottomColor: p.gray_200,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              backgroundColor:
                currentView === 'history' ? p.primary_600 : 'transparent',
              borderRadius: 8,
              marginRight: 8,
            }}
            onPress={() => setCurrentView('history')}
          >
            <Text
              style={{
                color: currentView === 'history' ? p.white_static : p.gray_max,
                fontWeight: '600',
              }}
            >
              History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              backgroundColor:
                currentView === 'portfolio' ? p.primary_600 : 'transparent',
              borderRadius: 8,
              marginLeft: 8,
            }}
            onPress={() => setCurrentView('portfolio')}
          >
            <Text
              style={{
                color:
                  currentView === 'portfolio' ? p.white_static : p.gray_max,
                fontWeight: '600',
              }}
            >
              Portfolio
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on selected view */}
        {/* {currentView === 'history' ? (
          <TxHistoryNavigator />
        ) : (
          <PortfolioNavigator />
        )} */}
      </View>
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
