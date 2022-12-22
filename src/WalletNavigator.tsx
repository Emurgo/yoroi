import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {VotingRegistration as VotingRegistration} from './Catalyst'
import {Icon, OfflineBanner} from './components'
import {DashboardNavigator} from './Dashboard'
import {useNfts} from './hooks'
import {isHaskellShelley} from './legacy/config'
import {MenuNavigator} from './Menu'
import {WalletStackRoutes, WalletTabRoutes} from './navigation'
import {NftDetailsNavigator} from './NftDetails/NftDetailsNavigator'
import {NftsNavigator} from './Nfts/NftsNavigator'
import {useSelectedWallet, WalletSelectionScreen} from './SelectedWallet'
import {SettingsScreenNavigator} from './Settings'
import {theme} from './theme'
import {TxHistoryNavigator} from './TxHistory'

const Tab = createBottomTabNavigator<WalletTabRoutes>()
const WalletTabNavigator = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {nfts} = useNfts(wallet)
  const initialRoute = isHaskellShelley(wallet.walletImplementationId) ? 'staking-dashboard' : 'history'

  return (
    <>
      <OfflineBanner />

      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: {fontSize: 11},
          tabBarActiveTintColor: theme.COLORS.NAVIGATION_ACTIVE,
          tabBarInactiveTintColor: theme.COLORS.NAVIGATION_INACTIVE,
        }}
        initialRouteName={initialRoute}
        backBehavior="initialRoute"
      >
        <Tab.Screen
          name="history"
          component={TxHistoryNavigator}
          options={{
            tabBarIcon: ({focused}) => (
              <Icon.TabWallet
                size={24}
                color={focused ? theme.COLORS.NAVIGATION_ACTIVE : theme.COLORS.NAVIGATION_INACTIVE}
              />
            ),
            tabBarLabel: strings.walletTabBarLabel,
            tabBarTestID: 'walletTabBarButton',
          }}
        />

        <Tab.Screen
          name="nfts"
          component={NftsNavigator}
          options={{
            tabBarIcon: ({focused}) => <Icon.Image size={28} color={focused ? '#17d1aa' : '#A7AFC0'} />,
            tabBarLabel: strings.nftsTabBarLabel(nfts?.length ?? 0),
            tabBarTestID: 'nftsTabBarButton',
          }}
        />

        {isHaskellShelley(wallet.walletImplementationId) && (
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

        <Tab.Screen
          name="menu"
          component={MenuNavigator}
          options={{
            tabBarIcon: ({focused}) => <Icon.Menu size={28} color={focused ? '#17d1aa' : '#A7AFC0'} />,
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
    id: 'global.nfts',
    defaultMessage: '!!!NFTs',
  },
  menuButton: {
    id: 'menu',
    defaultMessage: '!!!Menu',
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
    nftsTabBarLabel: (qty) => intl.formatMessage(messages.nftsButton, {qty}),
    menuTabBarLabel: intl.formatMessage(messages.menuButton),
  }
}
