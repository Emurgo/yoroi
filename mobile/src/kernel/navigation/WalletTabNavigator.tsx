import {GovernanceProvider} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import {
  BottomTabBar,
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'
import * as React from 'react'

import {DiscoverNavigator} from '~/features/Discover/DiscoverNavigator'
import {Menu} from '~/features/Menu/Menu'
import {P2PConnectionProviderWrapper} from '~/features/P2P/components/P2PConnectionProviderWrapper'
import {P2PConnectionStatusBar} from '~/features/P2P/components/P2PConnectionStatusBar'
import {PortfolioNavigator} from '~/features/Portfolio/PortfolioNavigator'
import {useGovernanceManagerMaker} from '~/features/Staking/Governance/common/helpers'
import {PoolTransitionProvider} from '~/features/Staking/Staking/PoolTransition/PoolTransitionProvider'
import {SwapProvider} from '~/features/Swap/common/SwapProvider'
import {TxHistoryNavigator} from '~/features/Transactions/TxHistoryNavigator'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'

import {shouldShowTabBarForRoutes} from './common/helpers'
import {WalletTabRoutes} from './types'

const Tab = createBottomTabNavigator<WalletTabRoutes>()

const TabBarWithHiddenContent = (props: BottomTabBarProps) => {
  const shouldShow = shouldShowTabBarForRoutes(props.state)
  return shouldShow ? <BottomTabBar {...props} /> : null
}

export const WalletTabNavigator = () => {
  const {palette: p, atoms: ta} = useTheme()
  const strings = useStrings()
  const manager = useGovernanceManagerMaker()

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
  const historyTabBarIcon = React.useCallback(
    ({
      focused,
      color,
      size,
    }: {
      focused: boolean
      color: string
      size: number
    }) =>
      focused ? (
        <Icon.TabWalletActive size={size} color={color} />
      ) : (
        <Icon.TabWallet size={size} color={color} />
      ),
    [],
  )

  const portfolioTabBarIcon = React.useCallback(
    ({
      focused,
      color,
      size,
    }: {
      focused: boolean
      color: string
      size: number
    }) =>
      focused ? (
        <Icon.TabPortfolioActive size={size} color={color} />
      ) : (
        <Icon.TabPortfolio size={size} color={color} />
      ),
    [],
  )

  const discoverTabBarIcon = React.useCallback(
    ({
      focused,
      color,
      size,
    }: {
      focused: boolean
      color: string
      size: number
    }) =>
      focused ? (
        <Icon.TabDiscoverActive size={size} color={color} />
      ) : (
        <Icon.TabDiscover size={size} color={color} />
      ),
    [],
  )

  const menuTabBarIcon = React.useCallback(
    ({
      focused,
      color,
      size,
    }: {
      focused: boolean
      color: string
      size: number
    }) =>
      focused ? (
        <Icon.TabMenuActive size={size} color={color} />
      ) : (
        <Icon.TabMenu size={size} color={color} />
      ),
    [],
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

      <Tab.Screen
        name="discover"
        getComponent={() => DiscoverNavigator}
        options={discoverOptions}
      />

      <Tab.Screen name="menu" getComponent={() => Menu} options={menuOptions} />
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
