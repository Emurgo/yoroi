import {NavigatorScreenParams, useNavigation, useRoute} from '@react-navigation/native'
import {StackNavigationOptions, StackNavigationProp} from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import {IntlShape} from 'react-intl'
import {Platform} from 'react-native'

import {HWDeviceInfo} from './legacy/ledgerUtils'
import type {RawUtxo} from './legacy/types'
import {COLORS} from './theme'
import {NetworkId, TokenEntry, WalletImplementationId, YoroiProvider} from './yoroi-wallets'
import {CreateDelegationTxResponse} from './yoroi-wallets/cardano/shelley/delegationUtils'

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
export const defaultStackNavigationOptionsV2: StackNavigationOptions = {
  headerTintColor: COLORS.ERROR_TEXT_COLOR_DARK,
  headerTitleStyle: {
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
  },
  headerRightContainerStyle: {
    paddingRight: 12,
  },
  headerStyle: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
}

export const defaultStackNavigationOptions: StackNavigationOptions = {
  headerStyle: {
    backgroundColor: COLORS.BACKGROUND_BLUE,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  headerBackTitleVisible: false,
  headerLeftContainerStyle: {
    paddingLeft: Platform.OS === 'ios' ? 8 : undefined,
  },
}

// ROUTES
export type BiometricParams = {
  onSuccess: (decryptedKey: string) => void | Promise<void>
  onFail?: (reason: string, intl: IntlShape) => void | Promise<void>
  keyId: string
  addWelcomeMessage?: boolean
  instructions?: string[]
}

export type WalletTabRoutes = {
  history: NavigatorScreenParams<TxHistoryRoutes>
  'send-ada': NavigatorScreenParams<SendRoutes>
  'receive-ada': NavigatorScreenParams<ReceiveRoutes>
  'staking-dashboard': NavigatorScreenParams<DashboardRoutes>
  'staking-center': NavigatorScreenParams<StakingCenterRoutes>
  menu: NavigatorScreenParams<MenuRoutes>
}

export type WalletSelectionParams = undefined | {reopen: boolean}
export type WalletStackRoutes = {
  'wallet-selection': WalletSelectionParams
  'main-wallet-routes': NavigatorScreenParams<WalletTabRoutes>
  settings: NavigatorScreenParams<SettingsStackRoutes>
  'catalyst-router': NavigatorScreenParams<CatalystRoutes>
}
export type WalletStackRouteNavigation = StackNavigationProp<WalletStackRoutes>

export type WalletInitRoutes = {
  'choose-create-restore': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    provider: YoroiProvider
  }
  'initial-choose-create-restore': undefined
  'create-wallet-form': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    provider: YoroiProvider
  }
  'restore-wallet-form': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    provider: YoroiProvider
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
  'mnemoinc-show': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    provider: YoroiProvider
    password: string
    name: string
    mnemonic: string
  }
  'mnemonic-check': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    provider: YoroiProvider
    password: string
    name: string
    mnemonic: string
  }
  'wallet-account-checksum': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    provider: YoroiProvider
    phrase: string
  }
  'wallet-credentials': {
    networkId: NetworkId
    walletImplementationId: WalletImplementationId
    provider: YoroiProvider
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
  send: undefined
  'select-asset': undefined
  'address-reader-qr': undefined
  'send-confirm': SendConfirmParams
}
export type TxHistoryRouteNavigation = StackNavigationProp<TxHistoryRoutes>

export type StakingCenterRoutes = {
  'staking-center-main': undefined
  'delegation-confirmation': {
    poolName: string
    poolHash: string
    transactionData: CreateDelegationTxResponse
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
  'fingerprint-link': undefined
  'remove-wallet': undefined
  'change-language': undefined
  'easy-confirmation': undefined
  'change-password': undefined
  'change-custom-pin': undefined
  'setup-custom-pin': {
    onSuccess: () => void | Promise<void>
  }
}
export type SettingsRouteNavigation = StackNavigationProp<SettingsStackRoutes>

export type SendConfirmParams = {
  transactionData: unknown
  defaultAssetAmount: BigNumber
  address: string
  balanceAfterTx: BigNumber | null
  availableAmount: BigNumber
  fee: BigNumber | null
  tokens: TokenEntry[]
  utxos: RawUtxo[]
}
export type SendRoutes = {
  'send-ada-main': undefined
  'select-asset': undefined
  'address-reader-qr': undefined
  'send-ada-confirm': SendConfirmParams
}
export type SendRouteNavigation = StackNavigationProp<SendRoutes>

export type DashboardRoutes = {
  'staking-dashboard-main': undefined
  'staking-center': NavigatorScreenParams<StakingCenterRoutes>
  'delegation-confirmation': undefined
}

export type CatalystRoutes = {
  'catalyst-landing': undefined
  'catalyst-generate-pin': undefined
  'catalyst-confirm-pin': undefined
  'catalyst-generate-trx': undefined
  'catalyst-transaction': undefined
  'catalyst-qr-code': undefined
}
export type CatalystRouteNavigation = StackNavigationProp<CatalystRoutes>

export type FirstRunRoutes = {
  'language-pick': undefined
  'accept-terms-of-service': undefined
  'custom-pin': undefined
}
export type FirstRunRouteNavigation = StackNavigationProp<FirstRunRoutes>

export type MenuRoutes = {
  menu: undefined
  'catalyst-voting': undefined
}

export type AppRoutes = {
  maintenance: undefined
  'first-run': NavigatorScreenParams<FirstRunRoutes>
  'screens-index': undefined
  storybook: undefined
  'new-wallet': NavigatorScreenParams<WalletInitRoutes>
  'app-root': NavigatorScreenParams<WalletStackRoutes>
  'custom-pin-auth': undefined
  'bio-auth-initial': BiometricParams
  biometrics: BiometricParams
  'setup-custom-pin': undefined
}
export type AppRouteNavigation = StackNavigationProp<AppRoutes>

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends AppRoutes {}
  }
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

  const resetToWalletSelection = (params?: WalletSelectionParams) => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'app-root',
          state: {
            routes: [{name: 'wallet-selection', params}],
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

  return {
    navigation,
    resetToTxHistory,
    resetToWalletSelection,
    navigateToSettings,
    navigateToTxHistory,
  }
}
