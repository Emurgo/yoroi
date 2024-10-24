import {MaterialTopTabNavigationOptions} from '@react-navigation/material-top-tabs'
import {NavigationState, NavigatorScreenParams, useNavigation, useRoute} from '@react-navigation/native'
import {StackNavigationOptions, StackNavigationProp, TransitionPresets} from '@react-navigation/stack'
import {isKeyOf} from '@yoroi/common'
import {Atoms, ThemedPalette, useTheme} from '@yoroi/theme'
import {Chain, Portfolio, Scan} from '@yoroi/types'
import React from 'react'
import {Dimensions, Platform, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import {Icon} from '../components/Icon'
import {Routes as StakingGovernanceRoutes} from '../features/Staking/Governance/common/navigation'

// prettier-ignore
export const useUnsafeParams = <Params, >() => {
  const route = useRoute()

  return route?.params as unknown as Params
}

// prettier-ignore
export const useParams = <Params, >(guard: Guard<Params>): Params => {
  const params = useRoute().params

  if (!params || !guard(params)) {
    throw new Error(`useParams: guard failed: ${JSON.stringify(params, null, 2)}`)
  }

  return params
}

type Guard<Params> = (params: Params | object) => params is Params

export const BackButton = (props: TouchableOpacityProps & {color?: string}) => {
  const {color} = useTheme()

  return (
    <TouchableOpacity {...props} testID="buttonBack2">
      <Icon.Chevron direction="left" color={props.color ?? color.gray_max} />
    </TouchableOpacity>
  )
}

// OPTIONS
const WIDTH = Dimensions.get('window').width

export const defaultStackNavigationOptions = (atoms: Atoms, color: ThemedPalette): StackNavigationOptions => {
  return {
    ...(Platform.OS === 'android' && {...TransitionPresets.SlideFromRightIOS}),
    detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
    cardStyle: {
      backgroundColor: color.bg_color_max,
    },
    cardOverlay: () => (
      <View
        style={{
          flex: 1,
          backgroundColor: color.bg_color_max,
        }}
      />
    ),
    headerTintColor: color.gray_max,
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
      backgroundColor: color.bg_color_max,
    },
    headerTitleStyle: {
      ...atoms.body_1_lg_medium,
      width: WIDTH - 75,
      textAlign: 'center',
    },
    headerTitleAlign: 'center',
    headerTitleContainerStyle: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerLeftContainerStyle: {
      ...atoms.pl_sm,
    },
    headerRightContainerStyle: {
      ...atoms.pr_sm,
    },
    headerLeft: (props) => <BackButton {...props} />,
  }
}

// NAVIGATOR TOP TABS OPTIONS
export const defaultMaterialTopTabNavigationOptions = (
  atoms: Atoms,
  color: ThemedPalette,
): MaterialTopTabNavigationOptions => {
  return {
    tabBarStyle: {backgroundColor: color.bg_color_max, elevation: 0, shadowOpacity: 0, marginHorizontal: 16},
    tabBarIndicatorStyle: {backgroundColor: color.primary_600, height: 2},
    tabBarLabelStyle: {
      textTransform: 'none',
      ...atoms.body_1_lg_medium,
    },
    tabBarActiveTintColor: color.primary_600,
    tabBarInactiveTintColor: color.gray_600,
  }
}

// ROUTES
export type WalletTabRoutes = {
  history: NavigatorScreenParams<TxHistoryRoutes>
  portfolio: NavigatorScreenParams<PortfolioRoutes>
  discover: NavigatorScreenParams<DiscoverRoutes>
  menu: NavigatorScreenParams<MenuRoutes>
}

export type WalletStackRoutes = {
  'setup-wallet': undefined
  'wallet-selection': undefined
  'exchange-result': undefined
  'main-wallet-routes': NavigatorScreenParams<WalletTabRoutes>
  'review-tx-routes': NavigatorScreenParams<ReviewTxRoutes>
  settings: NavigatorScreenParams<SettingsStackRoutes>
  'voting-registration': NavigatorScreenParams<VotingRegistrationRoutes>
  'toggle-analytics-settings': NavigatorScreenParams<ToggleAnalyticsSettingsRoutes>
  governance: NavigatorScreenParams<StakingGovernanceRoutes>
  'staking-dashboard': NavigatorScreenParams<DashboardRoutes>
}

export type WalletInitRoutes = {
  'setup-wallet-choose-setup-type': undefined
  'setup-wallet-choose-setup-type-init': undefined
  'setup-wallet-restore-choose-mnemonic-type': undefined
  'setup-wallet-details-form': undefined
  'setup-wallet-restore-form': undefined
  'setup-wallet-restore-details': undefined
  'setup-wallet-import-read-only': undefined
  'setup-wallet-save-read-only': undefined
  'setup-wallet-check-nano-x': undefined
  'setup-wallet-connect-nano-x': undefined
  'setup-wallet-save-nano-x': undefined
  'setup-wallet-about-recovery-phase': undefined
  'setup-wallet-recovery-phrase-mnemonic': undefined
  'setup-wallet-verify-recovery-phrase-mnemonic': undefined
  'setup-wallet-preparing-wallet': undefined
}
export type SetupWalletRouteNavigation = StackNavigationProp<WalletInitRoutes>

export type TxHistoryRoutes = {
  'history-list': undefined
  'tx-details': {
    id: string
  }
  'receive-single': undefined
  'receive-specific-amount': undefined
  'receive-multiple': undefined
  'send-start-tx': undefined
  'send-submitted-tx': {txId: string}
  'send-failed-tx': undefined
  'send-list-amounts-to-send': undefined
  'send-edit-amount': undefined
  'send-select-token-from-list': undefined
} & SwapTokenRoutes &
  ScanRoutes &
  ClaimRoutes &
  ExchangeRoutes
export type TxHistoryRouteNavigation = StackNavigationProp<TxHistoryRoutes>

type ScanStartParams = Readonly<{
  insideFeature: Scan.Feature
}>
export type ScanRoutes = {
  'scan-start': ScanStartParams
  'scan-claim-confirm-summary': undefined
  'scan-show-camera-permission-denied': undefined
}
type ClaimRoutes = {
  'claim-show-success': undefined
}

type SwapTokenRoutes = {
  'swap-start-swap': NavigatorScreenParams<SwapTabRoutes>
  'swap-review': undefined
  'swap-select-sell-token': undefined
  'swap-select-buy-token': undefined
  'swap-edit-slippage': undefined
  'swap-select-pool': undefined
  'swap-submitted-tx': {txId: string}
  'swap-failed-tx': undefined
  'swap-preprod-notice': undefined
}
export type SwapTokenRouteseNavigation = StackNavigationProp<SwapTokenRoutes>

export type StakingCenterRoutes = {
  'staking-center-main': undefined
  'delegation-failed-tx': undefined
}

export type SwapTabRoutes = {
  'token-swap': undefined
  orders: undefined
}

type ExchangeRoutes = {
  'exchange-create-order': undefined
  'exchange-result': undefined
  'exchange-select-buy-provider': undefined
  'exchange-select-sell-provider': undefined
}

export type ExchangeRoutesNavigation = StackNavigationProp<ExchangeRoutes>

export type StakingCenterRouteNavigation = StackNavigationProp<StakingCenterRoutes>

export type SettingsTabRoutes = {
  'wallet-settings': undefined
  'app-settings': undefined
}

export type SettingsStackRoutes = {
  'settings-system-log': undefined
  about: undefined
  'app-settings': undefined
  'main-settings': undefined
  'change-wallet-name': undefined
  'terms-of-use': undefined
  support: undefined
  analytics: undefined
  'enable-login-with-os': undefined
  'remove-wallet': undefined
  'change-language': undefined
  'change-currency': undefined
  'change-theme': undefined
  'change-network': undefined
  'preparing-network': {selectedNetwork: Chain.SupportedNetworks}
  'enable-easy-confirmation': undefined
  'disable-easy-confirmation': undefined
  'change-password': undefined
  'change-custom-pin': undefined
  'privacy-policy': undefined
  'enable-login-with-pin': {
    onSuccess: () => void | Promise<void>
  }
  'manage-collateral'?: {
    backButton?: {
      content: string
      onPress: () => void
    }
  }
  'collateral-confirm-tx': undefined
  'collateral-tx-submitted': undefined
  'collateral-tx-failed': undefined
}

export type ToggleAnalyticsSettingsRoutes = {
  settings: undefined
}

export type SettingsRouteNavigation = StackNavigationProp<SettingsStackRoutes>

export type DiscoverRoutes = {
  'discover-browser': NavigatorScreenParams<BrowserRoutes>
  'discover-select-dapp-from-list': undefined
  'discover-review-tx': {cbor: string}
}

export type BrowserRoutes = {
  'discover-browse-dapp': undefined
  'discover-search-dapp-in-browser': undefined
}

export type DashboardRoutes = {
  'staking-dashboard-main': undefined
  'staking-center': NavigatorScreenParams<StakingCenterRoutes>
  'delegation-failed-tx': undefined
}

export type PortfolioRoutes = {
  'dashboard-portfolio': undefined
  'portfolio-tokens-list': undefined
  'portfolio-token-details': {id: Portfolio.Token.Id}
  'portfolio-nfts': NavigatorScreenParams<NftRoutes>
  'tx-details': {
    id: string
  }
  history: NavigatorScreenParams<TxHistoryRoutes>
}

export type ReviewTxRoutes = {
  'review-tx': undefined
}

export type PortfolioTokenListTabRoutes = {
  'wallet-token': undefined
  'dapps-token': undefined
}

export type VotingRegistrationRoutes = {
  'download-catalyst': undefined
  'display-pin': undefined
  'confirm-pin': undefined
  'create-tx': undefined
  'confirm-tx': undefined
  'qr-code': undefined
}
export type VotingRegistrationRouteNavigation = StackNavigationProp<VotingRegistrationRoutes>

export type InititalizationRoutes = {
  initial: undefined
  'language-pick': undefined
  'enable-login-with-pin': undefined
  analytics: undefined
  'terms-of-service-changed': undefined
  'analytics-changed': undefined
  'read-terms-of-service': undefined
  'read-privacy-policy': undefined
}
export type InititalizationNavigation = StackNavigationProp<InititalizationRoutes>

type FirstRunRoutes = {
  'language-pick': undefined
  'accept-terms-of-service': undefined
  'accept-privacy-policy': undefined
  'enable-login-with-pin': undefined
}

export type NftRoutes = {
  'nft-gallery': undefined
  'nft-details': {id: Portfolio.Token.Id}
  'nft-image-zoom': {id: Portfolio.Token.Id}
}
export type NftRouteNavigation = StackNavigationProp<NftRoutes>

type MenuRoutes = {
  menu: undefined
  'voting-registration': undefined
}

export type AppRoutes = {
  'first-run': NavigatorScreenParams<FirstRunRoutes>
  developer: undefined
  storybook: undefined
  playground: undefined
  'manage-wallets': NavigatorScreenParams<WalletStackRoutes>
  'custom-pin-auth': undefined
  'exchange-result': undefined
  'bio-auth-initial': undefined
  'enable-login-with-pin': undefined
  'agreement-changed-notice': undefined
  modal: undefined
  'choose-biometric-login': undefined
  'dark-theme-announcement': undefined
  'setup-wallet': undefined
  notifications: undefined
}
export type AppRouteNavigation = StackNavigationProp<AppRoutes>

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends AppRoutes {}
  }
}

export const useBlockGoBack = () => {
  const navigation = useNavigation()

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type !== 'RESET') {
        e.preventDefault()
      }
    })
    return () => unsubscribe()
  }, [navigation])
}

export const useWalletNavigation = () => {
  const navigation = useNavigation()

  return React.useRef({
    navigation,

    resetToTxHistory: () => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'manage-wallets',
            state: {
              routes: [
                {name: 'wallet-selection'},
                {
                  name: 'main-wallet-routes',
                  state: {
                    routes: [
                      {
                        name: 'history',
                        state: {
                          routes: [{name: 'history-list'}],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      })
    },

    resetToStartTransfer: () => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'manage-wallets',
            state: {
              routes: [
                {name: 'wallet-selection'},
                {
                  name: 'main-wallet-routes',
                  state: {
                    routes: [
                      {
                        name: 'history',
                        state: {
                          routes: [{name: 'send-start-tx'}],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      })
    },

    navigateToStartTransfer: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'send-start-tx',
          },
        },
      })
    },

    navigateToTxReview: () => {
      navigation.navigate('manage-wallets', {
        screen: 'review-tx-routes',
        params: {
          screen: 'review-tx',
        },
      })
    },

    resetToWalletSetupInit: () => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'manage-wallets',
            state: {
              routes: [
                {
                  name: 'setup-wallet',
                  state: {
                    routes: [{name: 'setup-wallet-choose-setup-type-init'}],
                  },
                },
              ],
            },
          },
        ],
      })
    },

    resetToWalletSetup: () => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'manage-wallets',
            state: {
              routes: [
                {name: 'wallet-selection'},
                {
                  name: 'setup-wallet',
                  state: {
                    routes: [{name: 'setup-wallet-choose-setup-type'}],
                  },
                },
              ],
            },
          },
        ],
      })
    },

    resetToWalletSelection: () => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'manage-wallets',
            state: {
              routes: [{name: 'wallet-selection'}],
            },
          },
        ],
      })
    },

    navigateToStakingDashboard: () => {
      navigation.navigate('manage-wallets', {
        screen: 'staking-dashboard',
        params: {
          screen: 'staking-dashboard-main',
        },
      })
    },

    navigateToSettings: () => {
      navigation.navigate('manage-wallets', {
        screen: 'settings',
        params: {
          screen: 'main-settings',
        },
      })
    },

    navigateToChangeNetwork: () => {
      navigation.navigate('manage-wallets', {
        screen: 'settings',
        params: {
          screen: 'change-network',
        },
      })
    },

    navigateToTxHistory: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'history-list',
          },
        },
      })
    },

    navigateToAppSettings: () => {
      navigation.navigate('manage-wallets', {
        screen: 'settings',
        params: {
          screen: 'app-settings',
        },
      })
    },

    navigateToCollateralSettings: (params?: SettingsStackRoutes['manage-collateral']) => {
      navigation.navigate('manage-wallets', {
        screen: 'settings',
        params: {
          screen: 'manage-collateral',
          params,
        },
      })
    },

    navigateToAnalyticsSettings: () => {
      navigation.navigate('manage-wallets', {
        screen: 'toggle-analytics-settings',
        params: {
          screen: 'settings',
        },
      })
    },

    navigateToGovernanceCentre: ({navigateToStakingOnSuccess = false} = {}) => {
      navigation.navigate('manage-wallets', {
        screen: 'governance',
        params: {
          screen: 'staking-gov-home',
          params: {
            navigateToStakingOnSuccess,
          },
        },
      })
    },

    navigateToDiscoverBrowserDapp: () => {
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'discover',
          params: {
            screen: 'discover-browser',
            params: {
              screen: 'discover-browse-dapp',
            },
          },
        },
      })
    },
  } as const).current
}

export const shouldShowTabBarForRoutes = (state: NavigationState) => {
  const routes = getFocusedRouteName(state)

  if (routes.length === 1) {
    const [route] = routes
    return Object.keys(routesWithTabBar).includes(route)
  }

  const [route, subRoute] = routes
  return isKeyOf(route, routesWithTabBar) && routesWithTabBar[route].includes(subRoute)
}

const routesWithTabBar: Record<keyof WalletTabRoutes, string[]> = {
  history: ['history-list'],
  portfolio: ['dashboard-portfolio'],
  discover: ['discover-select-dapp-from-list'],
  menu: ['_menu'],
}

const getFocusedRouteName = (state: Partial<NavigationState> | NavigationState['routes'][0]['state']): string[] => {
  const currentRoute = state?.routes?.[state?.index ?? -1]
  const currentState = currentRoute?.state
  const name = currentRoute?.name ?? null
  if (name === null) return []

  if (currentState) {
    return [name, ...getFocusedRouteName(currentState)]
  }

  return [name]
}
