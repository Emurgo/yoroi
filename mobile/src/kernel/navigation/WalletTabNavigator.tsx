import {GovernanceProvider} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import {
  BottomTabBar,
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'
import * as React from 'react'
import {View} from 'react-native'

import {useHasRedeemableThaws} from '~/features/Airdrop/common/useHasRedeemableThaws'
import {DiscoverNavigator} from '~/features/Discover/DiscoverNavigator'
import {MenuNavigator} from '~/features/Menu/Menu'
import {P2PConnectionProviderWrapper} from '~/features/P2P/components/P2PConnectionProviderWrapper'
import {P2PConnectionStatusBar} from '~/features/P2P/components/P2PConnectionStatusBar'
import {PortfolioNavigator} from '~/features/Portfolio/PortfolioNavigator'
import {useGovernanceManagerMaker} from '~/features/Staking/Governance/common/helpers'
import {PoolTransitionProvider} from '~/features/Staking/Staking/PoolTransition/PoolTransitionProvider'
import {SwapProvider} from '~/features/Swap/common/SwapProvider'
import {TxHistoryNavigator} from '~/features/Transactions/TxHistoryNavigator'
import {useIsByronWallet} from '~/features/WalletManager/hooks/useIsByronWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'
import {WalletTabNotification} from '~/ui/WalletTabNotification/WalletTabNotification'

import {shouldShowTabBarForRoutes} from './common/helpers'
import {WalletTabRoutes} from './types'

const Tab = createBottomTabNavigator<WalletTabRoutes>()

const TabBarWithHiddenContent = (props: BottomTabBarProps) => {
  const shouldShow = shouldShowTabBarForRoutes(props.state)
  return shouldShow ? <BottomTabBar {...props} /> : null
}

// Helper to create tab icon with optional notification
const createTabIcon =
  (
    ActiveIcon: React.ComponentType<{size: number; color: string}>,
    InactiveIcon: React.ComponentType<{size: number; color: string}>,
    showNotification: boolean,
  ) =>
  ({focused, color, size}: {focused: boolean; color: string; size: number}) => (
    <View style={a.relative}>
      {focused ? (
        <ActiveIcon size={size} color={color} />
      ) : (
        <InactiveIcon size={size} color={color} />
      )}
      <WalletTabNotification show={showNotification} />
    </View>
  )

export const WalletTabNavigator = () => {
  const {palette: p, atoms: ta} = useTheme()
  const strings = useStrings()
  const manager = useGovernanceManagerMaker()
  const {hasRedeemableThaws} = useHasRedeemableThaws()
  const isByronWallet = useIsByronWallet()

  // Memoize screenOptions to prevent recreation on every render
  const screenOptions = React.useMemo(
    () => ({
      headerShown: false,
      tabBarStyle: {
        ...ta.bg_color_max,
        borderTopWidth: 0.5,
        borderTopColor: p.gray_200,
      },
      tabBarActiveTintColor: p.primary_600,
      tabBarInactiveTintColor: p.gray_600,
      tabBarLabelStyle: {
        ...a.body_3_sm_medium,
      },
      sceneStyle: {
        backgroundColor: p.bg_color_max,
      },
    }),
    [ta.bg_color_max, p.gray_200, p.primary_600, p.gray_600, p.bg_color_max],
  )

  // Memoize tab bar icons to prevent recreation on every render
  const historyTabBarIcon = React.useMemo(
    () => createTabIcon(Icon.TabWalletActive, Icon.TabWallet, false),
    [],
  )

  const portfolioTabBarIcon = React.useMemo(
    () => createTabIcon(Icon.TabPortfolioActive, Icon.TabPortfolio, false),
    [],
  )

  const discoverTabBarIcon = React.useMemo(
    () => createTabIcon(Icon.TabDiscoverActive, Icon.TabDiscover, false),
    [],
  )

  const menuTabBarIcon = React.useMemo(
    () => createTabIcon(Icon.TabMenuActive, Icon.TabMenu, hasRedeemableThaws),
    [hasRedeemableThaws],
  )

  // Memoize screen options to prevent recreation on every render
  const historyOptions = React.useMemo(
    () => ({
      title: strings.transactions.history.historyTitle,
      tabBarIcon: historyTabBarIcon,
    }),
    [strings.transactions.history.historyTitle, historyTabBarIcon],
  )

  const portfolioOptions = React.useMemo(
    () => ({
      title: strings.portfolio.portfolio,
      tabBarIcon: portfolioTabBarIcon,
    }),
    [strings.portfolio.portfolio, portfolioTabBarIcon],
  )

  const discoverOptions = React.useMemo(
    () => ({
      title: strings.discover.discoverTitle,
      tabBarIcon: discoverTabBarIcon,
    }),
    [strings.discover.discoverTitle, discoverTabBarIcon],
  )

  const menuOptions = React.useMemo(
    () => ({
      title: strings.menu.menu,
      tabBarIcon: menuTabBarIcon,
    }),
    [strings.menu.menu, menuTabBarIcon],
  )

  const tabNavigator = (
    <Tab.Navigator
      tabBar={TabBarWithHiddenContent}
      screenOptions={screenOptions}
    >
      <Tab.Screen
        name="history"
        getComponent={() => TxHistoryNavigator}
        options={historyOptions}
      />

      <Tab.Screen
        name="portfolio"
        getComponent={() => PortfolioNavigator}
        options={portfolioOptions}
      />

      {!isByronWallet && (
        <Tab.Screen
          name="discover"
          getComponent={() => DiscoverNavigator}
          options={discoverOptions}
        />
      )}

      <Tab.Screen
        name="menu"
        getComponent={() => MenuNavigator}
        options={menuOptions}
      />
    </Tab.Navigator>
  )

  return (
    <SwapProvider>
      <PoolTransitionProvider>
        <P2PConnectionProviderWrapper>
          <P2PConnectionStatusBar />
          {manager ? (
            <GovernanceProvider manager={manager}>
              {tabNavigator}
            </GovernanceProvider>
          ) : (
            tabNavigator
          )}
        </P2PConnectionProviderWrapper>
      </PoolTransitionProvider>
    </SwapProvider>
  )
}
