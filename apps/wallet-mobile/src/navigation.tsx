import {MaterialTopTabNavigationOptions} from '@react-navigation/material-top-tabs'
import {
  getFocusedRouteNameFromRoute,
  NavigatorScreenParams,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import {StackNavigationOptions, StackNavigationProp} from '@react-navigation/stack'
import {Theme, useTheme} from '@yoroi/theme'
import React from 'react'
import {Dimensions, TouchableOpacity, TouchableOpacityProps, ViewStyle} from 'react-native'

import {Icon} from './components'
import {ScanFeature} from './features/Scan/common/types'
import {Routes as StakingGovernanceRoutes} from './features/Staking/Governance/common/navigation'
import {YoroiUnsignedTx} from './yoroi-wallets/types'

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
  const {theme} = useTheme()

  return (
    <TouchableOpacity {...props} testID="buttonBack2">
      <Icon.Chevron direction="left" color={props.color ?? theme.color.gray.max} />
    </TouchableOpacity>
  )
}

// OPTIONS
const WIDTH = Dimensions.get('window').width
export const defaultStackNavigationOptions = (theme: Theme): StackNavigationOptions => {
  return {
    headerTintColor: theme.color.gray.max,
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
      backgroundColor: theme.color.gray.min,
    },
    headerTitleStyle: {
      ...theme.typography['body-1-l-medium'],
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
      ...theme.padding['l-s'],
    },
    headerRightContainerStyle: {
      ...theme.padding['r-s'],
    },
    cardStyle: {backgroundColor: 'white'},
    headerLeft: (props) => <BackButton {...props} />,
  }
}

// NAVIGATOR TOP TABS OPTIONS
export const defaultMaterialTopTabNavigationOptions = (theme: Theme): MaterialTopTabNavigationOptions => {
  return {
    tabBarStyle: {backgroundColor: theme.color.gray.min, elevation: 0, shadowOpacity: 0, marginHorizontal: 16},
    tabBarIndicatorStyle: {backgroundColor: theme.color.primary[600], height: 2},
    tabBarLabelStyle: {
      textTransform: 'none',
      ...theme.typography['body-1-l-medium'],
    },
    tabBarActiveTintColor: theme.color.primary[600],
    tabBarInactiveTintColor: theme.color.gray[600],
  }
}

// ROUTES
export type WalletTabRoutes = {
  history: NavigatorScreenParams<TxHistoryRoutes>
  'staking-dashboard': NavigatorScreenParams<DashboardRoutes>
  nfts: NavigatorScreenParams<NftRoutes>
  menu: NavigatorScreenParams<MenuRoutes>
}

export type WalletStackRoutes = {
  'choose-biometric-login': undefined
  'wallet-selection': undefined
  'exchange-result': undefined
  'main-wallet-routes': NavigatorScreenParams<WalletTabRoutes>
  'nft-details-routes': NavigatorScreenParams<NftRoutes>
  settings: NavigatorScreenParams<SettingsStackRoutes>
  'voting-registration': NavigatorScreenParams<VotingRegistrationRoutes>
  'toggle-analytics-settings': NavigatorScreenParams<ToggleAnalyticsSettingsRoutes>
  governance: NavigatorScreenParams<StakingGovernanceRoutes>
}
export type WalletStackRouteNavigation = StackNavigationProp<WalletStackRoutes>

export type WalletInitRoutes = {
  'add-wallet-choose-setup-type': undefined
  'add-wallet-choose-network': undefined
  'add-wallet-choose-mnemonic-type': undefined
  'initial-add-wallet-choose-setup-type': undefined
  'add-wallet-details-form': undefined
  'add-wallet-restore-form': undefined
  'add-wallet-restore-details': undefined
  'add-wallet-import-read-only': undefined
  'add-wallet-save-read-only': undefined
  'add-wallet-check-nano-x': undefined
  'add-wallet-connect-nano-x': undefined
  'add-wallet-save-nano-x': undefined
  'add-wallet-about-recovery-phase': undefined
  'add-wallet-recovery-phrase-mnemonic': undefined
  'add-wallet-verify-recovery-phrase-mnemonic': undefined
}
export type WalletInitRouteNavigation = StackNavigationProp<WalletInitRoutes>

export type ReceiveRoutes = {
  'receive-ada-main': undefined
}

export type TxHistoryRoutes = {
  'history-list': undefined
  'history-details': {
    id: string
  }
  'receive-single': undefined
  'receive-specific-amount': undefined
  'receive-multiple': undefined
  'send-start-tx': undefined
  'send-confirm-tx': undefined
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
  insideFeature: ScanFeature
}>
export type ScanRoutes = {
  'scan-start': ScanStartParams
  'scan-claim-confirm-summary': undefined
  'scan-show-camera-permission-denied': undefined
}
export type ClaimRoutes = {
  'claim-show-success': undefined
}

export type SwapTokenRoutes = {
  'swap-start-swap': undefined
  'swap-confirm-tx': undefined
  'swap-select-sell-token': undefined
  'swap-select-buy-token': undefined
  'swap-edit-slippage': undefined
  'swap-select-pool': undefined
  'swap-submitted-tx': {txId: string}
  'swap-failed-tx': undefined
  'app-root': undefined
}
export type SwapTokenRouteseNavigation = StackNavigationProp<SwapTokenRoutes>

export type StakingCenterRoutes = {
  'staking-center-main': undefined
  'delegation-confirmation': {
    poolId: string
    yoroiUnsignedTx: YoroiUnsignedTx
  }
}

export type SwapTabRoutes = {
  'token-swap': undefined
  orders: undefined
}

export type ExchangeRoutes = {
  'exchange-create-order': undefined
  'exchange-result': undefined
  'exchange-select-buy-provider': undefined
  'exchange-select-sell-provider': undefined
  'app-root': undefined
}

export type ExchangeRoutesNavigation = StackNavigationProp<ExchangeRoutes>

export type StakingCenterRouteNavigation = StackNavigationProp<StakingCenterRoutes>

export type SettingsTabRoutes = {
  'wallet-settings': undefined
  'app-settings': undefined
}

export type SettingsStackRoutes = {
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

export type SendConfirmParams = {
  yoroiUnsignedTx: YoroiUnsignedTx
}

export type DashboardRoutes = {
  'staking-dashboard-main': undefined
  'staking-center': NavigatorScreenParams<StakingCenterRoutes>
  'delegation-confirmation': undefined
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

export type FirstRunRoutes = {
  'language-pick': undefined
  'accept-terms-of-service': undefined
  'accept-privacy-policy': undefined
  'enable-login-with-pin': undefined
}
export type FirstRunRouteNavigation = StackNavigationProp<FirstRunRoutes>

export type NftRoutes = {
  'nft-gallery': undefined
  'nft-details': {id: string}
  'image-zoom': {id: string}
}

export type MenuRoutes = {
  menu: undefined
  'voting-registration': undefined
}

export type AppRoutes = {
  'first-run': NavigatorScreenParams<FirstRunRoutes>
  developer: undefined
  storybook: undefined
  'new-wallet': NavigatorScreenParams<WalletInitRoutes>
  'app-root': NavigatorScreenParams<WalletStackRoutes>
  'custom-pin-auth': undefined
  'exchange-result': undefined
  'bio-auth-initial': undefined
  'enable-login-with-pin': undefined
  'agreement-changed-notice': undefined
  modal: undefined
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
            name: 'app-root',
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
            name: 'app-root',
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
      navigation.navigate('app-root', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'send-start-tx',
          },
        },
      })
    },

    resetToWalletSelection: () => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'app-root',
            state: {
              routes: [{name: 'wallet-selection'}],
            },
          },
        ],
      })
    },

    navigateToStakingDashboard: () => {
      navigation.navigate('app-root', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'staking-dashboard',
          params: {
            screen: 'staking-dashboard-main',
          },
        },
      })
    },

    navigateToSettings: () => {
      navigation.navigate('app-root', {
        screen: 'settings',
        params: {
          screen: 'main-settings',
        },
      })
    },

    navigateToTxHistory: () => {
      navigation.navigate('app-root', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'history-list',
          },
        },
      })
    },

    navigateToNftGallery: () => {
      navigation.navigate('app-root', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'nfts',
          params: {
            screen: 'nft-gallery',
          },
        },
      })
    },

    navigateToAppSettings: () => {
      navigation.navigate('app-root', {
        screen: 'settings',
        params: {
          screen: 'app-settings',
        },
      })
    },

    navigateToCollateralSettings: (params?: SettingsStackRoutes['manage-collateral']) => {
      navigation.navigate('app-root', {
        screen: 'settings',
        params: {
          screen: 'manage-collateral',
          params,
        },
      })
    },

    navigateToAnalyticsSettings: () => {
      navigation.navigate('app-root', {
        screen: 'toggle-analytics-settings',
        params: {
          screen: 'settings',
        },
      })
    },

    navigateToGovernanceCentre: ({navigateToStakingOnSuccess = false} = {}) => {
      navigation.navigate('app-root', {
        screen: 'governance',
        params: {
          screen: 'staking-gov-home',
          params: {
            navigateToStakingOnSuccess,
          },
        },
      })
    },
  } as const).current
}

export const hideTabBarForRoutes = (route: RouteProp<WalletTabRoutes, 'history'>): ViewStyle | undefined =>
  getFocusedRouteNameFromRoute(route)?.startsWith('scan') ||
  getFocusedRouteNameFromRoute(route)?.startsWith('swap') ||
  getFocusedRouteNameFromRoute(route)?.startsWith('receive') ||
  getFocusedRouteNameFromRoute(route)?.startsWith('exchange')
    ? {display: 'none'}
    : undefined
