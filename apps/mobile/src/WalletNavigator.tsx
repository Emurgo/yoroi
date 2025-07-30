import {
  BottomTabBar,
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'
import {useFocusEffect} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Keyboard, Platform, StyleSheet, View} from 'react-native'

import {DashboardNavigator} from '~/features/Dashboard/DashboardNavigator'
import {DiscoverNavigator} from '~/features/Discover'
import {ShowExchangeResultOrderScreen} from '~/features/Exchange/useCases/ShowExchangeResultOrderScreen/ShowExchangeResultOrderScreen'
import {useLinksRequestAction} from '~/features/Links/common/useLinksRequestAction'
import {useLinksShowActionResult} from '~/features/Links/common/useLinksShowActionResult'
import {MenuNavigator} from '~/features/Menu/Menu'
import {PortfolioNavigator} from '~/features/Portfolio/PortfolioNavigator'
import {CatalystNavigator} from '~/features/RegisterCatalyst/CatalystNavigator'
import {ReviewTxNavigator} from '~/features/ReviewTx/ReviewTxNavigator'
import {SearchProvider} from '~/features/Search/SearchContext'
import {SettingsScreenNavigator} from '~/features/Settings/SettingsScreenNavigator'
import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {SetupWalletNavigator} from '~/features/SetupWallet/SetupWalletNavigator'
import {GovernanceNavigator} from '~/features/Staking/Governance/GovernanceNavigator'
import {SwapProvider} from '~/features/Swap/common/SwapProvider'
import {ToggleAnalyticsSettingsNavigator} from '~/features/ToggleAnalyticsSettings'
import {TxHistoryNavigator} from '~/features/Transactions/TxHistoryNavigator'
import {SelectWalletFromList} from '~/features/WalletManager/screens/SelectWalletFromListScreen/SelectWalletFromListScreen'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {
  defaultStackNavigationOptions,
  shouldShowTabBarForRoutes,
  WalletStackRoutes,
  WalletTabRoutes,
} from '~/kernel/navigation/navigation'
import {Icon} from '~/ui/Icon'
import {OfflineBanner} from '~/ui/OfflineBanner/OfflineBanner'

const Tab = createBottomTabNavigator<WalletTabRoutes>()

const TabBarWithHiddenContent = (props: BottomTabBarProps) => {
  const shouldShow = shouldShowTabBarForRoutes(props.state)
  return shouldShow ? <BottomTabBar {...props} /> : null
}

const WalletTabNavigator = () => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false)

  React.useEffect(() => {
    if (Platform.OS === 'android') return

    const showSubscription = Keyboard.addListener('keyboardWillShow', () => {
      setIsKeyboardOpen(true)
    })
    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setIsKeyboardOpen(false)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.walletPageViewed()
    }, [track]),
  )

  return (
    <SwapProvider>
      <OfflineBanner />

      <Tab.Navigator
        sceneContainerStyle={{backgroundColor: p.bg_color_max}}
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: [ta.text_primary_medium, a.button_2_md],
          tabBarActiveTintColor: p.primary_600,
          tabBarInactiveTintColor: p.gray_600,
          tabBarBackground: () => (
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: p.bg_color_max,
              }}
            />
          ),
          tabBarStyle: {
            borderTopColor: p.gray_200,
            borderTopWidth: 2 * StyleSheet.hairlineWidth,

            // keyboardWillShow keyboardWillHiden dont work on android
            display: isKeyboardOpen ? 'none' : undefined,
          },
          tabBarHideOnKeyboard: true,
        }}
        tabBar={(props) => <TabBarWithHiddenContent {...props} />}
        backBehavior="initialRoute"
      >
        <Tab.Screen
          name="history"
          options={{
            tabBarIcon: ({focused}) =>
              focused ? (
                <Icon.TabWalletActive size={24} color={p.primary_600} />
              ) : (
                <Icon.TabWallet size={24} color={p.gray_600} />
              ),
            tabBarLabel: strings.walletTabBarLabel,
            tabBarTestID: 'walletTabBarButton',
          }}
        >
          {() => (
            <SearchProvider>
              <TxHistoryNavigator />
            </SearchProvider>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="portfolio"
          initialParams={{screen: 'dashboard-portfolio'}}
          options={{
            tabBarIcon: ({focused}) =>
              focused ? (
                <Icon.TabPortfolioActive size={24} color={p.primary_600} />
              ) : (
                <Icon.TabPortfolio size={24} color={p.gray_600} />
              ),
            tabBarLabel: strings.portfolioButton,
            tabBarTestID: 'portfolioTabBarButton',
          }}
        >
          {() => (
            <SearchProvider>
              <PortfolioNavigator />
            </SearchProvider>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="discover"
          options={{
            tabBarIcon: ({focused}) =>
              focused ? (
                <Icon.TabDiscoverActive size={28} color={p.primary_600} />
              ) : (
                <Icon.TabDiscover size={28} color={p.gray_600} />
              ),
            tabBarLabel: strings.discoverTabBarLabel,
            tabBarTestID: 'discoverTabBarButton',
          }}
        >
          {() => (
            <SearchProvider>
              <DiscoverNavigator />
            </SearchProvider>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="menu"
          component={MenuNavigator}
          options={{
            tabBarIcon: ({focused}) =>
              focused ? (
                <Icon.TabMenuActive size={24} color={p.primary_600} />
              ) : (
                <Icon.TabMenu size={24} color={p.gray_600} />
              ),
            tabBarLabel: strings.menuTabBarLabel,
            tabBarTestID: 'menuTabBarButton',
          }}
        />
      </Tab.Navigator>
    </SwapProvider>
  )
}

const Stack = createStackNavigator<WalletStackRoutes>()
export const WalletNavigator = () => {
  const initialRoute = useLinksShowActionResult()
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  useLinksRequestAction()

  const navOptions = React.useMemo(
    () => defaultStackNavigationOptions(ta, p),
    [ta, p],
  )

  // initialRoute doesn't update the state of the navigator, only at first render
  // https://reactnavigation.org/docs/auth-flow/
  if (initialRoute === 'exchange-result') {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false /* used only for transition */,
          detachPreviousScreen:
            false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
        }}
      >
        <Stack.Screen
          name="exchange-result"
          component={ShowExchangeResultOrderScreen}
        />
      </Stack.Navigator>
    )
  }

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
          component={WalletTabNavigator}
        />

        <Stack.Screen
          name="settings"
          options={{headerShown: false}}
          component={SettingsScreenNavigator}
        />

        <Stack.Screen
          name="review-tx-routes"
          options={{headerShown: false}}
          component={ReviewTxNavigator}
        />

        <Stack.Screen
          name="voting-registration"
          options={{headerShown: false}}
          getComponent={() => CatalystNavigator}
        />

        <Stack.Screen
          name="toggle-analytics-settings"
          options={{headerShown: false}}
          component={ToggleAnalyticsSettingsNavigator}
        />

        <Stack.Screen
          name="governance"
          options={{headerShown: false}}
          component={GovernanceNavigator}
        />

        <Stack.Screen
          name="staking-dashboard"
          options={{headerShown: false}}
          component={DashboardNavigator}
        />
      </Stack.Navigator>
    </SearchProvider>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    walletTabBarLabel: intl.formatMessage(messages.walletTabBarLabel),
    portfolioButton: intl.formatMessage(messages.portfolioButton),
    discoverTabBarLabel: intl.formatMessage(messages.discoverTabBarLabel),
    menuTabBarLabel: intl.formatMessage(messages.menuTabBarLabel),
    walletSelectionScreenHeader: intl.formatMessage(
      messages.walletSelectionScreenHeader,
    ),
  }
}

const messages = {
  walletTabBarLabel: {
    id: 'wallet.tabBar.label',
    defaultMessage: 'Wallet',
  },
  portfolioButton: {
    id: 'portfolio.button',
    defaultMessage: 'Portfolio',
  },
  discoverTabBarLabel: {
    id: 'discover.tabBar.label',
    defaultMessage: 'Discover',
  },
  menuTabBarLabel: {
    id: 'menu.tabBar.label',
    defaultMessage: 'Menu',
  },
  walletSelectionScreenHeader: {
    id: 'wallet.selection.screen.header',
    defaultMessage: 'Select Wallet',
  },
}
