import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {RouteProp, useFocusEffect} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Keyboard, Platform} from 'react-native'

import {VotingRegistration} from './Catalyst'
import {Icon, OfflineBanner} from './components'
import {DashboardNavigator} from './Dashboard'
import {DappExplorerNavigator} from './features/DappExplorer'
import {MenuNavigator} from './features/Menu'
import {SettingsScreenNavigator} from './features/Settings'
import {GovernanceNavigator} from './features/Staking/Governance'
import {ToggleAnalyticsSettingsNavigator} from './features/ToggleAnalyticsSettings'
import {CONFIG} from './legacy/config'
import {useMetrics} from './metrics/metricsManager'
import {hideTabBarForRoutes, WalletStackRoutes, WalletTabRoutes} from './navigation'
import {NftDetailsNavigator} from './NftDetails/NftDetailsNavigator'
import {NftsNavigator} from './Nfts/NftsNavigator'
import {SearchProvider} from './Search/SearchContext'
import {useSelectedWallet, WalletSelectionScreen} from './SelectedWallet'
import {theme} from './theme'
import {TxHistoryNavigator} from './TxHistory'
import {isHaskellShelley} from './yoroi-wallets/cardano/utils'

const Tab = createBottomTabNavigator<WalletTabRoutes>()
const WalletTabNavigator = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const initialRoute = 'history'

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
          tabBarLabelStyle: {fontSize: 11},
          tabBarActiveTintColor: theme.COLORS.NAVIGATION_ACTIVE,
          tabBarInactiveTintColor: theme.COLORS.NAVIGATION_INACTIVE,
          tabBarStyle: {
            // keyboardWillShow keyboardWillHiden dont work on android
            display: isKeyboardOpen ? 'none' : undefined,
          },
          tabBarHideOnKeyboard: Platform.OS === 'android',
        }}
        initialRouteName={initialRoute}
        backBehavior="initialRoute"
      >
        <Tab.Screen
          name="history"
          options={({route}: {route: RouteProp<WalletTabRoutes, 'history'>}) => ({
            tabBarIcon: ({focused}) => (
              <Icon.TabWallet
                size={24}
                color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE}
              />
            ),
            tabBarLabel: strings.walletTabBarLabel,
            tabBarTestID: 'walletTabBarButton',
            tabBarStyle: hideTabBarForRoutes(route),
          })}
        >
          {() => (
            <SearchProvider>
              <TxHistoryNavigator />
            </SearchProvider>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="nfts"
          options={{
            tabBarIcon: ({focused}) => (
              <Icon.Image
                size={28}
                color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE}
              />
            ),
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

        {isHaskellShelley(wallet.walletImplementationId) && !CONFIG.DAPP_EXPLORER_ENABLED && (
          <Tab.Screen
            name="staking-dashboard"
            component={DashboardNavigator}
            options={{
              tabBarIcon: ({focused}) => (
                <Icon.TabStaking
                  size={24}
                  color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE}
                />
              ),
              tabBarLabel: strings.stakingButton,
              tabBarTestID: 'stakingTabBarButton',
            }}
          />
        )}

        {isHaskellShelley(wallet.walletImplementationId) && CONFIG.DAPP_EXPLORER_ENABLED && (
          <Tab.Screen
            name="dapp-explorer"
            component={DappExplorerNavigator}
            options={{
              tabBarIcon: ({focused}) => (
                <Icon.Compass
                  size={24}
                  color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE}
                />
              ),
              tabBarLabel: strings.dappExplorerTabBarLabel,
              tabBarTestID: 'dappExplorerTabBarButton',
            }}
          />
        )}

        <Tab.Screen
          name="menu"
          component={MenuNavigator}
          options={{
            tabBarIcon: ({focused}) => (
              <Icon.Menu
                size={28}
                color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE}
              />
            ),
            tabBarLabel: strings.menuTabBarLabel,
            tabBarTestID: 'menuTabBarButton',
          }}
        />
      </Tab.Navigator>
    </>
  )
}

const Stack = createStackNavigator<WalletStackRoutes>()
export const WalletNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false /* used only for transition */,
      detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
    }}
  >
    <Stack.Screen name="wallet-selection" component={WalletSelectionScreen} />

    <Stack.Screen name="main-wallet-routes" component={WalletTabNavigator} />

    <Stack.Screen name="nft-details-routes" component={NftDetailsNavigator} />

    <Stack.Screen name="settings" component={SettingsScreenNavigator} />

    <Stack.Screen name="voting-registration" component={VotingRegistration} />

    <Stack.Screen name="toggle-analytics-settings" component={ToggleAnalyticsSettingsNavigator} />

    <Stack.Screen name="governance" component={GovernanceNavigator} />

    <Stack.Screen name="dapp-explorer" component={DappExplorerNavigator} />
  </Stack.Navigator>
)

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
  dappExplorerButton: {
    id: 'components.common.navigation.dappExplorerButton',
    defaultMessage: '!!!Discover',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    stakingButton: intl.formatMessage(messages.stakingButton),
    txHistoryTabBarLabel: intl.formatMessage(messages.transactionsButton),
    sendTabBarLabel: intl.formatMessage(messages.sendButton),
    receiveTabBarLabel: intl.formatMessage(messages.receiveButton),
    delegateTabBarLabel: intl.formatMessage(messages.delegateButton),
    walletTabBarLabel: intl.formatMessage(messages.walletButton),
    nftsTabBarLabel: intl.formatMessage(messages.nftsButton),
    menuTabBarLabel: intl.formatMessage(messages.menuButton),
    dappExplorerTabBarLabel: intl.formatMessage(messages.dappExplorerButton),
  }
}
