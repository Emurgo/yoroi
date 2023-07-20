import {NavigatorScreenParams, useNavigation, useRoute} from '@react-navigation/native'
import {StackNavigationOptions, StackNavigationProp} from '@react-navigation/stack'
import React from 'react'
import {Dimensions, Platform, TouchableOpacity} from 'react-native'

import {Icon} from './components'
import {COLORS} from './theme'
import {HWDeviceInfo} from './yoroi-wallets/hw'
import {NetworkId, WalletImplementationId, YoroiUnsignedTx} from './yoroi-wallets/types'

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

// OPTIONS
const WIDTH = Dimensions.get('window').width
export const defaultStackNavigationOptionsV2: StackNavigationOptions = {
  headerTintColor: COLORS.ERROR_TEXT_COLOR_DARK,
  headerStyle: {
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitleStyle: {
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
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
    paddingLeft: 10,
  },
  headerRightContainerStyle: {
    paddingRight: 10,
  },
  headerLeft: (props) => (
    <TouchableOpacity {...props}>
      <Icon.Chevron direction="left" color="#000000" />
    </TouchableOpacity>
  ),
}

export const defaultStackNavigationOptions: StackNavigationOptions = {
  headerStyle: {
    backgroundColor: COLORS.BACKGROUND_BLUE,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: '#fff',
  headerBackTitleVisible: false,
  headerTitleAlign: 'center',
  headerLeftContainerStyle: {
    paddingLeft: Platform.OS === 'ios' ? 8 : undefined,
  },
}

// ROUTES
export type WalletTabRoutes = {
  history: NavigatorScreenParams<TxHistoryRoutes>
  'staking-dashboard': NavigatorScreenParams<DashboardRoutes>
  nfts: NavigatorScreenParams<NftRoutes>
  menu: NavigatorScreenParams<MenuRoutes>
}

export type WalletStackRoutes = {
  'wallet-selection': undefined
  'main-wallet-routes': NavigatorScreenParams<WalletTabRoutes>
  'nft-details-routes': NavigatorScreenParams<NftRoutes>
  settings: NavigatorScreenParams<SettingsStackRoutes>
  'voting-registration': NavigatorScreenParams<VotingRegistrationRoutes>
}
export type WalletStackRouteNavigation = StackNavigationProp<WalletStackRoutes>

export type WalletInitRoutes = {
  'choose-create-restore': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
  }
  'initial-choose-create-restore': undefined
  'create-wallet-form': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
  }
  'restore-wallet-form': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
  }
  'import-read-only': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
  }
  'save-read-only': {
    publicKeyHex: string
    path: number[]
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
  }
  'check-nano-x': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    useUSB: boolean
  }
  'connect-nano-x': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    useUSB: boolean
  }
  'save-nano-x': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    hwDeviceInfo: HWDeviceInfo
  }
  'mnemonic-show': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    password: string
    name: string
    mnemonic: string
  }
  'mnemonic-check': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    password: string
    name: string
    mnemonic: string
  }
  'wallet-account-checksum': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    phrase: string
  }
  'wallet-credentials': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    phrase: string
  }
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
  receive: undefined
  'send-start-tx': undefined
  'send-read-qr-code': undefined
  'send-confirm-tx': undefined
  'send-submitted-tx': undefined
  'send-failed-tx': undefined
  'send-list-amounts-to-send': undefined
  'send-edit-amount': undefined
  'send-select-token-from-list': undefined
  'swap-start': undefined
  'swap-select-tokens': undefined
  'swap-select-token-from': undefined
  'swap-select-token-to': undefined
  'swap-slippage-tolerance-input': undefined
  'swap-select-pool': undefined
}
export type TxHistoryRouteNavigation = StackNavigationProp<TxHistoryRoutes>

export type SwapTokenRoutes = {
  'swap-start': undefined
  'swap-select-tokens': undefined
  'swap-select-token-from': undefined
  'swap-select-token-to': undefined
  'swap-slippage-tolerance-input': undefined
  'swap-select-pool': undefined
}
export type SwapTokenRouteseNavigation = StackNavigationProp<SwapTokenRoutes>

export type StakingCenterRoutes = {
  'staking-center-main': undefined
  'delegation-confirmation': {
    poolId: string
    yoroiUnsignedTx: YoroiUnsignedTx
  }
}
export type StakingCenterRouteNavigation = StackNavigationProp<StakingCenterRoutes>

export type SettingsTabRoutes = {
  'wallet-settings': undefined
  'app-settings': undefined
}

export type SettingsStackRoutes = {
  'settings-main': undefined
  'change-wallet-name': undefined
  'terms-of-use': undefined
  support: undefined
  'enable-login-with-os': undefined
  'remove-wallet': undefined
  'change-language': undefined
  'change-currency': undefined
  'enable-easy-confirmation': undefined
  'disable-easy-confirmation': undefined
  'change-password': undefined
  'change-custom-pin': undefined
  'enable-login-with-pin': {
    onSuccess: () => void | Promise<void>
  }
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

export type FirstRunRoutes = {
  'language-pick': undefined
  'accept-terms-of-service': undefined
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
  'bio-auth-initial': undefined
  'enable-login-with-pin': undefined
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

  const resetToTxHistory = () => {
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
  }

  const resetToWalletSelection = () => {
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
  }

  const navigateToSettings = () => {
    navigation.navigate('app-root', {
      screen: 'settings',
      params: {
        screen: 'settings-main',
      },
    })
  }

  const navigateToTxHistory = () => {
    navigation.navigate('app-root', {
      screen: 'main-wallet-routes',
      params: {
        screen: 'history',
        params: {
          screen: 'history-list',
        },
      },
    })
  }

  const navigateToNftGallery = () => {
    navigation.navigate('app-root', {
      screen: 'main-wallet-routes',
      params: {
        screen: 'nfts',
        params: {
          screen: 'nft-gallery',
        },
      },
    })
  }

  return {
    navigation,
    resetToTxHistory,
    resetToWalletSelection,
    navigateToSettings,
    navigateToTxHistory,
    navigateToNftGallery,
  }
}
