import {Chain, Portfolio, Scan} from '@yoroi/types'

import {NavigatorScreenParams} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import {useNavigation} from '@react-navigation/native'

import {OnConfirm} from '~/features/ReviewTx/common/hooks/useOnConfirm'
import {ReviewDetailsProps} from '~/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Overview/OverviewTab'
import {Routes as StakingGovernanceRoutes} from '~/features/Staking/Governance/common/navigation'

export type Guard<Params> = (params: Params | object) => params is Params

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
  'settings': NavigatorScreenParams<SettingsStackRoutes>
  'voting-registration': NavigatorScreenParams<VotingRegistrationRoutes>
  'toggle-analytics-settings': NavigatorScreenParams<ToggleAnalyticsSettingsRoutes>
  'governance': NavigatorScreenParams<StakingGovernanceRoutes>
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
  'utxo-list': undefined
  'utxo-consolidation': undefined
  'receive-single': undefined
  'receive-specific-amount': undefined
  'receive-multiple': undefined
  'send-start-tx': undefined
  'send-list-amounts-to-send': undefined
  'send-edit-amount': undefined
  'send-submitted-tx': undefined
  'send-failed-tx': undefined
  'send-select-token-from-list': undefined
} & SwapTokenRoutes &
  ScanRoutes &
  ClaimRoutes &
  ExchangeRoutes &
  NotificationCenterRoutes

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

type NotificationCenterRoutes = {
  'notification-center-history': undefined
}

export type SwapTokenRoutes = {
  'swap-main': undefined
  'swap-orders': undefined
  'swap-settings': undefined
  'swap-review': undefined
  'swap-select-token': {direction: 'in' | 'out'}
  'swap-select-protocol': undefined
  'swap-preprod-notice': undefined
  'swap-submitted-tx': undefined
  'swap-failed-tx': undefined
}

export type SwapTokenRouteseNavigation = StackNavigationProp<SwapTokenRoutes>

export type StakingCenterRoutes = {
  'staking-center-main': undefined
}

export type ExchangeRoutes = {
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
  'about': undefined
  'app-settings': undefined
  'main-settings': undefined
  'change-wallet-name': undefined
  'terms-of-use': undefined
  'support': undefined
  'analytics': undefined
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
  'manage-notifications'?: {
    screen: keyof ManageNotificationsRoutes
  }
  'settings-preparing-wallet': undefined
}

export type ManageNotificationsRoutes = {
  'manage-notification-display-duration': undefined
  'manage-notification-settings': undefined
}

export type ToggleAnalyticsSettingsRoutes = {
  settings: undefined
}

export type SettingsRouteNavigation = StackNavigationProp<SettingsStackRoutes>

export type DiscoverRoutes = {
  'discover-browser': NavigatorScreenParams<BrowserRoutes>
  'discover-select-dapp-from-list': undefined
}

export type BrowserRoutes = {
  'discover-browse-dapp': undefined
  'discover-search-dapp-in-browser': undefined
}

export type DashboardRoutes = {
  'staking-dashboard-main': undefined
  'staking-center': NavigatorScreenParams<StakingCenterRoutes>
  'staking-submitted-tx': undefined
  'staking-failed-tx': undefined
}

export type PortfolioRoutes = {
  'dashboard-portfolio': undefined
  'portfolio-tokens-list': undefined
  'portfolio-token-details': {id: Portfolio.Token.Id}
  'portfolio-nfts': NavigatorScreenParams<NftRoutes>
  'tx-details': {
    id: string
  }
  'history': NavigatorScreenParams<TxHistoryRoutes>
}

export type PortfolioTokenListTabRoutes = {
  'wallet-token': undefined
  'dapps-token': undefined
}

export type ReviewTxRoutes = {
  'review-tx'?: {
    cbor?: string
    partial?: boolean
    preventSubmit?: boolean
    operations?: Array<React.ReactNode>
    operationsNotice?: React.ReactNode
    receiverCustomTitle?: React.ReactNode
    details?: ReviewDetailsProps
    createdBy?: React.ReactNode
    onConfirm?: () => void
    onCancel?: OnConfirm['onCancel']
    onSuccess?: OnConfirm['onSuccess']
    onError?: OnConfirm['onError']
    onClose?: OnConfirm['onClose']
    onNotSupportedCIP1694?: () => void
    onCIP36SupportChange?: (supportsCIP36: boolean) => void
  }
  'review-tx-submitted-tx': undefined
  'review-tx-failed-tx': undefined
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
  'initial': undefined
  'language-pick': undefined
  'enable-login-with-pin': undefined
  'analytics': undefined
  'terms-of-service-changed': undefined
  'analytics-changed': undefined
  'read-terms-of-service': undefined
  'read-privacy-policy': undefined
}

export type InititalizationNavigation = StackNavigationProp<InititalizationRoutes>

export type FirstAction =
  | 'first-run'
  | 'show-agreement-changed-notice'
  | 'auth-with-pin'
  | 'auth-with-os'
  | 'request-new-pin'

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

export type MenuRoutes = {
  '_menu': undefined
  'voting-registration': undefined
}

export type AppRoutes = {
  'first-run': NavigatorScreenParams<FirstRunRoutes>
  'developer': undefined
  'storybook': undefined
  'playground': undefined
  'manage-wallets': NavigatorScreenParams<WalletStackRoutes>
  'custom-pin-auth': undefined
  'exchange-result': undefined
  'bio-auth-initial': undefined
  'enable-login-with-pin': undefined
  'agreement-changed-notice': undefined
  'modal': undefined
  'choose-biometric-login': undefined
  'dark-theme-announcement': undefined
  'setup-wallet': undefined
  'notifications': undefined
}

export type AppRouteNavigation = StackNavigationProp<AppRoutes>

export type WalletNavigation = {
  navigation: ReturnType<typeof useNavigation>
  resetToTxHistory: () => void
  resetToStartTransfer: () => void
  navigateToStartTransfer: () => void
  navigateToTxReview: (params?: ReviewTxRoutes['review-tx']) => void
  resetToWalletSetupInit: () => void
  resetToWalletSetup: () => void
  resetToWalletSelection: () => void
  navigateToStakingDashboard: () => void
  navigateToMenu: () => void
  navigateToSettings: () => void
  navigateToChangeNetwork: () => void
  navigateToTxHistory: () => void
  navigateToAppSettings: () => void
  navigateToCollateralSettings: (params?: SettingsStackRoutes['manage-collateral']) => void
  navigateToNotificationDisplayDuration: () => void
  navigateToNotificationSettings: () => void
  navigateToNotifications: () => void
  navigateToAnalyticsSettings: () => void
  navigateToGovernanceCentre: () => void
  navigateToDiscoverBrowserDapp: () => void
  navigateToSwap: (tokenOutId?: Portfolio.Token.Id) => void
  navigateToExchange: () => void
  navigateToUtxoList: () => void
  navigateToUtxoConsolidation: () => void
  navigateToTxDetails: (id: string) => void
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppRoutes {}
  }
}
