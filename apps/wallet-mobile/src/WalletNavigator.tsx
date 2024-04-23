import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {RouteProp, useFocusEffect} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Keyboard, Platform} from 'react-native'

import {VotingRegistration} from './Catalyst'
import {Icon, OfflineBanner} from './components'
import {DashboardNavigator} from './Dashboard'
import {ShowExchangeResultOrderScreen} from './features/Exchange/useCases/ShowExchangeResultOrderScreen/ShowExchangeResultOrderScreen'
import {useLinksRequestAction} from './features/Links/common/useLinksRequestAction'
import {useLinksShowActionResult} from './features/Links/common/useLinksShowActionResult'
import {MenuNavigator} from './features/Menu'
import {SettingsScreenNavigator} from './features/Settings'
import {SetupWalletNavigator} from './features/SetupWallet/SetupWalletNavigator'
import {
  ChooseBiometricLoginScreen,
  useShowBiometricsScreen,
} from './features/SetupWallet/useCases/ChooseBiometricLogin/ChooseBiometricLoginScreen'
import {GovernanceNavigator} from './features/Staking/Governance'
import {ToggleAnalyticsSettingsNavigator} from './features/ToggleAnalyticsSettings'
import {useSelectedWallet} from './features/WalletManager/Context/SelectedWalletContext'
import {SelectWalletFromList} from './features/WalletManager/SelectWalletFromList/SelectWalletFromListScreen'
import {useMetrics} from './metrics/metricsManager'
import {hideTabBarForRoutes, WalletStackRoutes, WalletTabRoutes} from './navigation'
import {defaultStackNavigationOptions} from './navigation'
import {NftDetailsNavigator} from './NftDetails/NftDetailsNavigator'
import {NftsNavigator} from './Nfts/NftsNavigator'
import {SearchProvider} from './Search/SearchContext'
import {TxHistoryNavigator} from './TxHistory'
import {useWalletManager} from './wallet-manager/WalletManagerContext'
import {useAuthSetting, useIsAuthOsSupported} from './yoroi-wallets/auth'
import {isHaskellShelley} from './yoroi-wallets/cardano/utils'
import {useHasWallets} from './yoroi-wallets/hooks'

const Tab = createBottomTabNavigator<WalletTabRoutes>()
const WalletTabNavigator = () => {
  const strings = useStrings()
  const {colors} = useStyles()
  const wallet = useSelectedWallet()
  const initialRoute = isHaskellShelley(wallet.walletImplementationId) ? 'staking-dashboard' : 'history'

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
          tabBarActiveTintColor: colors.active,
          tabBarInactiveTintColor: colors.inactive,
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
            tabBarIcon: ({focused}) => <Icon.TabWallet size={24} color={focused ? colors.active : colors.inactive} />,
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

        {isHaskellShelley(wallet.walletImplementationId) && (
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
  const {theme} = useTheme()
  useLinksRequestAction()
  const isAuthOsSupported = useIsAuthOsSupported()
  const {showBiometricsScreen} = useShowBiometricsScreen()
  const walletManager = useWalletManager()
  const {hasWallets} = useHasWallets(walletManager)
  const authSetting = useAuthSetting()

  const shouldAskToUseAuthWithOs = showBiometricsScreen && isAuthOsSupported && authSetting !== 'os'

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
        ...defaultStackNavigationOptions(theme),
        headerLeft: undefined,
        detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
      }}
    >
      {!hasWallets && shouldAskToUseAuthWithOs && (
        <Stack.Screen //
          name="choose-biometric-login"
          options={{headerShown: false}}
          component={ChooseBiometricLoginScreen}
        />
      )}

      {!hasWallets && !shouldAskToUseAuthWithOs && (
        <Stack.Screen //
          name="setup-wallet"
          options={{headerShown: false}}
          component={SetupWalletNavigator}
        />
      )}

      <Stack.Screen
        name="wallet-selection"
        options={{title: strings.walletSelectionScreenHeader}}
        component={SelectWalletFromList}
      />

      <Stack.Screen name="main-wallet-routes" options={{headerShown: false}} component={WalletTabNavigator} />

      <Stack.Screen name="nft-details-routes" options={{headerShown: false}} component={NftDetailsNavigator} />

      <Stack.Screen name="settings" options={{headerShown: false}} component={SettingsScreenNavigator} />

      <Stack.Screen name="voting-registration" options={{headerShown: false}} component={VotingRegistration} />

      <Stack.Screen
        name="toggle-analytics-settings"
        options={{headerShown: false}}
        component={ToggleAnalyticsSettingsNavigator}
      />

      <Stack.Screen name="governance" options={{headerShown: false}} component={GovernanceNavigator} />
    </Stack.Navigator>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme

  const colors = {
    active: color.primary[600],
    inactive: color.gray[600],
  }
  return {colors}
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
  walletSelectionScreenHeader: {
    id: 'components.walletselection.walletselectionscreen.header',
    defaultMessage: '!!!My wallets',
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
    walletSelectionScreenHeader: intl.formatMessage(messages.walletSelectionScreenHeader),
  }
}
