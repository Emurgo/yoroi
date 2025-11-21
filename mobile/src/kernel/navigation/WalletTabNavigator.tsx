import {GovernanceProvider} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import {
  BottomTabBar,
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'
import * as React from 'react'
import {AppState, InteractionManager} from 'react-native'

import {DiscoverNavigator} from '~/features/Discover/DiscoverNavigator'
import {MenuNavigator} from '~/features/Menu/Menu'
import {pushNotificationsManager} from '~/features/Notifications/common/notification-manager'
import {
  handleNotificationInternalNavigationAction,
  shouldHandleNotificationInternalNavigationAction,
} from '~/features/Notifications/common/tools'
import {PortfolioNavigator} from '~/features/Portfolio/PortfolioNavigator'
import {useGovernanceManagerMaker} from '~/features/Staking/Governance/common/helpers'
import {PoolTransitionProvider} from '~/features/Staking/Staking/PoolTransition/PoolTransitionProvider'
import {SwapProvider} from '~/features/Swap/common/SwapProvider'
import {TxHistoryNavigator} from '~/features/Transactions/TxHistoryNavigator'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'

import {shouldShowTabBarForRoutes} from './common/helpers'
import {useWalletNavigation} from './hooks/useWalletNavigation'
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
  const walletNavigation = useWalletNavigation()

  React.useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active') {
        const shouldHandle =
          await shouldHandleNotificationInternalNavigationAction()
        if (shouldHandle) {
          InteractionManager.runAfterInteractions(async () => {
            await handleNotificationInternalNavigationAction(
              pushNotificationsManager,
              walletNavigation,
            )
          })
        }
      }
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    return () => subscription.remove()
  }, [walletNavigation])

  return (
    <SwapProvider>
      <PoolTransitionProvider>
        <GovernanceProvider manager={manager}>
          <Tab.Navigator
            tabBar={TabBarWithHiddenContent}
            screenOptions={{
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
            }}
          >
            <Tab.Screen
              name="history"
              getComponent={() => TxHistoryNavigator}
              options={{
                title: strings.transactions.history.historyTitle,
                tabBarIcon: ({focused, color, size}) =>
                  focused ? (
                    <Icon.TabWalletActive size={size} color={color} />
                  ) : (
                    <Icon.TabWallet size={size} color={color} />
                  ),
              }}
            />

            <Tab.Screen
              name="portfolio"
              getComponent={() => PortfolioNavigator}
              options={{
                title: strings.portfolio.portfolio,
                tabBarIcon: ({focused, color, size}) =>
                  focused ? (
                    <Icon.TabPortfolioActive size={size} color={color} />
                  ) : (
                    <Icon.TabPortfolio size={size} color={color} />
                  ),
              }}
            />

            <Tab.Screen
              name="discover"
              getComponent={() => DiscoverNavigator}
              options={{
                title: strings.discover.discoverTitle,
                tabBarIcon: ({focused, color, size}) =>
                  focused ? (
                    <Icon.TabDiscoverActive size={size} color={color} />
                  ) : (
                    <Icon.TabDiscover size={size} color={color} />
                  ),
              }}
            />

            <Tab.Screen
              name="menu"
              getComponent={() => MenuNavigator}
              options={{
                title: strings.menu.menu,
                tabBarIcon: ({focused, color, size}) =>
                  focused ? (
                    <Icon.TabMenuActive size={size} color={color} />
                  ) : (
                    <Icon.TabMenu size={size} color={color} />
                  ),
              }}
            />
          </Tab.Navigator>
        </GovernanceProvider>
      </PoolTransitionProvider>
    </SwapProvider>
  )
}
