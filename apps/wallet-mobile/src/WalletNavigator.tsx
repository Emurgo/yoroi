import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {RouteProp, useFocusEffect} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Keyboard, Platform, StyleSheet} from 'react-native'

import {Icon, OfflineBanner} from './components'
import {DiscoverNavigator} from './features/Discover'
import {ShowExchangeResultOrderScreen} from './features/Exchange/useCases/ShowExchangeResultOrderScreen/ShowExchangeResultOrderScreen'
import {useLinksRequestAction} from './features/Links/common/useLinksRequestAction'
import {useLinksShowActionResult} from './features/Links/common/useLinksShowActionResult'
import {MenuNavigator} from './features/Menu'
import {NftsNavigator} from './features/Nfts/NftsNavigator'
import {PortfolioNavigator} from './features/Portfolio/PortfolioNavigator'
import {SearchProvider} from './features/Search/SearchContext'
import {SettingsScreenNavigator} from './features/Settings'
import {SetupWalletNavigator} from './features/SetupWallet/SetupWalletNavigator'
import {GovernanceNavigator} from './features/Staking/Governance'
import {ToggleAnalyticsSettingsNavigator} from './features/ToggleAnalyticsSettings'
import {SelectWalletFromList} from './features/WalletManager/useCases/SelectWalletFromListScreen/SelectWalletFromListScreen'
import {dappExplorerEnabled} from './kernel/config'
import {useMetrics} from './kernel/metrics/metricsManager'
import {
  defaultStackNavigationOptions,
  hideTabBarForRoutes,
  WalletStackRoutes,
  WalletTabRoutes,
} from './kernel/navigation'
import {VotingRegistration} from './legacy/Catalyst'
import {DashboardNavigator} from './legacy/Dashboard'
import {TxHistoryNavigator} from './legacy/TxHistory'

const Tab = createBottomTabNavigator<WalletTabRoutes>()
const WalletTabNavigator = () => {
  const strings = useStrings()
  const {colors, styles} = useStyles()

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
    <>
      <OfflineBanner />

      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: styles.labelStyle,
          tabBarActiveTintColor: colors.active,
          tabBarInactiveTintColor: colors.inactive,
          tabBarStyle: {
            backgroundColor: colors.background,
            // keyboardWillShow keyboardWillHiden dont work on android
            display: isKeyboardOpen ? 'none' : undefined,
          },
          tabBarHideOnKeyboard: true,
        }}
        backBehavior="initialRoute"
      >
        <Tab.Screen
          name="history"
          options={({route}: {route: RouteProp<WalletTabRoutes, 'history'>}) => ({
            tabBarIcon: ({focused}) => <Icon.TabWallet size={24} color={focused ? colors.active : colors.inactive} />,
            tabBarLabel: strings.walletTabBarLabel,
            tabBarTestID: 'walletTabBarButton',
            tabBarStyle: {
              ...hideTabBarForRoutes(route),
              backgroundColor: colors.background,
            },
          })}
        >
          {() => (
            <SearchProvider>
              <TxHistoryNavigator />
            </SearchProvider>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="portfolio"
          options={({route}: {route: RouteProp<WalletTabRoutes, 'portfolio'>}) => ({
            tabBarIcon: ({focused}) => (
              <Icon.TabPortfolio size={24} color={focused ? colors.active : colors.inactive} />
            ),
            tabBarLabel: strings.portfolioButton,
            tabBarTestID: 'portfolioTabBarButton',
            tabBarStyle: {
              ...hideTabBarForRoutes(route),
              backgroundColor: colors.background,
            },
          })}
        >
          {() => (
            <SearchProvider>
              <PortfolioNavigator />
            </SearchProvider>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="nfts"
          options={{
            tabBarIcon: ({focused}) => <Icon.Image size={28} color={focused ? colors.active : colors.inactive} />,
            tabBarLabel: strings.nftsTabBarLabel,
            tabBarTestID: 'nftsTabBarButton',
          }}
        >
          {() => (
            <SearchProvider>
              <NftsNavigator />
            </SearchProvider>
          )}
        </Tab.Screen>

        {dappExplorerEnabled ? (
          <Tab.Screen
            name="discover"
            options={({route}: {route: RouteProp<WalletTabRoutes, 'discover'>}) => ({
              tabBarIcon: ({focused}) => <Icon.Discover size={28} color={focused ? colors.active : colors.inactive} />,
              tabBarLabel: strings.discoverTabBarLabel,
              tabBarTestID: 'discoverTabBarButton',
              tabBarStyle: {
                ...hideTabBarForRoutes(route),
                backgroundColor: colors.background,
              },
            })}
          >
            {() => (
              <SearchProvider>
                <DiscoverNavigator />
              </SearchProvider>
            )}
          </Tab.Screen>
        ) : (
          <Tab.Screen
            name="staking-dashboard"
            component={DashboardNavigator}
            options={{
              tabBarIcon: ({focused}) => (
                <Icon.TabStaking size={24} color={focused ? colors.active : colors.inactive} />
              ),
              tabBarLabel: strings.stakingButton,
              tabBarTestID: 'stakingTabBarButton',
            }}
          />
        )}

        <Tab.Screen
          name="menu"
          component={MenuNavigator}
          options={{
            tabBarIcon: ({focused}) => <Icon.Menu size={28} color={focused ? colors.active : colors.inactive} />,
            tabBarLabel: strings.menuTabBarLabel,
            tabBarTestID: 'menuTabBarButton',
          }}
        />
      </Tab.Navigator>
    </>
  )
}

const Stack = createStackNavigator<WalletStackRoutes>()
export const WalletNavigator = () => {
  const initialRoute = useLinksShowActionResult()
  const strings = useStrings()
  const {atoms, color} = useTheme()
  useLinksRequestAction()

  // initialRoute doesn't update the state of the navigator, only at first render
  // https://reactnavigation.org/docs/auth-flow/
  if (initialRoute === 'exchange-result') {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false /* used only for transition */,
          detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
        }}
      >
        <Stack.Screen name="exchange-result" component={ShowExchangeResultOrderScreen} />
      </Stack.Navigator>
    )
  }

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions(atoms, color),
        headerLeft: undefined,
        detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
      }}
    >
      <Stack.Screen
        name="wallet-selection"
        options={{title: strings.walletSelectionScreenHeader}}
        component={SelectWalletFromList}
      />

      <Stack.Screen //
        name="setup-wallet"
        options={{headerShown: false}}
        component={SetupWalletNavigator}
      />

      <Stack.Screen name="main-wallet-routes" options={{headerShown: false}} component={WalletTabNavigator} />

      <Stack.Screen name="settings" options={{headerShown: false}} component={SettingsScreenNavigator} />

      <Stack.Screen name="voting-registration" options={{headerShown: false}} component={VotingRegistration} />

      <Stack.Screen
        name="toggle-analytics-settings"
        options={{headerShown: false}}
        component={ToggleAnalyticsSettingsNavigator}
      />

      <Stack.Screen name="governance" options={{headerShown: false}} component={GovernanceNavigator} />

      <Stack.Screen name="staking-dashboard" options={{headerShown: false}} component={DashboardNavigator} />
    </Stack.Navigator>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    labelStyle: {
      ...atoms.font_semibold,
      ...atoms.text_center,
      fontSize: 10,
      lineHeight: 18,
    },
  })

  const colors = {
    active: color.text_primary_high,
    inactive: color.text_gray_medium,
    background: color.gray_cmin,
  }
  return {colors, styles}
}

const messages = defineMessages({
  transactionsButton: {
    id: 'components.common.navigation.transactionsButton',
    defaultMessage: '!!!Transactions',
  },
  sendButton: {
    id: 'components.txhistory.txnavigationbuttons.sendButton',
    defaultMessage: '!!!Send',
  },
  receiveButton: {
    id: 'components.txhistory.txnavigationbuttons.receiveButton',
    defaultMessage: '!!!Receive',
  },
  dashboardButton: {
    id: 'components.common.navigation.dashboardButton',
    defaultMessage: '!!!Dashboard',
  },
  delegateButton: {
    id: 'components.common.navigation.delegateButton',
    defaultMessage: '!!!Delegate',
  },
  walletButton: {
    id: 'components.settings.walletsettingscreen.tabTitle',
    defaultMessage: '!!!Wallet',
  },
  stakingButton: {
    id: 'global.staking',
    defaultMessage: '!!!Staking',
  },
  nftsButton: {
    id: 'components.common.navigation.nftGallery',
    defaultMessage: '!!!NFT Gallery',
  },
  menuButton: {
    id: 'menu',
    defaultMessage: '!!!Menu',
  },
  discoverButton: {
    id: 'components.common.navigation.discover',
    defaultMessage: '!!!Discover',
  },
  walletSelectionScreenHeader: {
    id: 'components.walletselection.walletselectionscreen.header',
    defaultMessage: '!!!My wallets',
  },
  portfolioButton: {
    id: 'global.portfolio',
    defaultMessage: '!!!Portfolio',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    portfolioButton: intl.formatMessage(messages.portfolioButton),
    stakingButton: intl.formatMessage(messages.stakingButton),
    txHistoryTabBarLabel: intl.formatMessage(messages.transactionsButton),
    sendTabBarLabel: intl.formatMessage(messages.sendButton),
    receiveTabBarLabel: intl.formatMessage(messages.receiveButton),
    delegateTabBarLabel: intl.formatMessage(messages.delegateButton),
    walletTabBarLabel: intl.formatMessage(messages.walletButton),
    nftsTabBarLabel: intl.formatMessage(messages.nftsButton),
    menuTabBarLabel: intl.formatMessage(messages.menuButton),
    discoverTabBarLabel: intl.formatMessage(messages.discoverButton),
    walletSelectionScreenHeader: intl.formatMessage(messages.walletSelectionScreenHeader),
  }
}
