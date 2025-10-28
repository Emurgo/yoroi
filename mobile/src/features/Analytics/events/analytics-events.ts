import {AnalyticsEventEnum} from '../types/analytics-event-enum'

// Onboarding Events
export type OnboardingEvent =
  | AnalyticsEventEnum.OnboardingPinCodePageViewed
  | AnalyticsEventEnum.OnboardingBiometricsPageViewed
  | AnalyticsEventEnum.OnboardingThemePageViewed

// Send Events
export type SendEvent =
  | AnalyticsEventEnum.SendInitiated
  | AnalyticsEventEnum.SendSelectAssetPageViewed

// Transaction Review Events
export type TransactionReviewEvent =
  | AnalyticsEventEnum.TransactionReviewModalViewed
  | AnalyticsEventEnum.TransactionReviewSubmitModalViewed
  | AnalyticsEventEnum.TransactionResultsPopupViewed

export type TransactionReviewProperties = {
  [AnalyticsEventEnum.TransactionReviewModalViewed]: {
    type: string
    asset_count: number
    asset_list: string
  }
  [AnalyticsEventEnum.TransactionReviewSubmitModalViewed]: undefined
  [AnalyticsEventEnum.TransactionResultsPopupViewed]: {
    status: 'Success' | 'Failure'
  }
}

// Staking Events
export type StakingEvent = AnalyticsEventEnum.StakingCenterPageViewed

// Governance Events
export type GovernanceEvent = AnalyticsEventEnum.GovernanceDashboardPageViewed

// Fiat Ramp Events
export type FiatRampEvent =
  | AnalyticsEventEnum.WalletPageBuyBannerClicked
  | AnalyticsEventEnum.WalletPageExchangeClicked

// Swap Events
export type SwapEvent =
  | AnalyticsEventEnum.SwapInitiated
  | AnalyticsEventEnum.SwapReviewPageViewed

// Portfolio Events
export type PortfolioEvent =
  | AnalyticsEventEnum.PortfolioDashboardPageViewed
  | AnalyticsEventEnum.PortfolioTokensListPageViewed

// NFT Events
export type NFTEvent =
  | AnalyticsEventEnum.NFTGalleryPageViewed
  | AnalyticsEventEnum.NFTGalleryDetailsPageViewed

export type NFTProperties = {
  [AnalyticsEventEnum.NFTGalleryPageViewed]: {
    nft_count: number
  }
  [AnalyticsEventEnum.NFTGalleryDetailsPageViewed]: undefined
}

// Dapps Events
export type DappsEvent =
  | AnalyticsEventEnum.DiscoverPageViewed
  | AnalyticsEventEnum.DappConnectorSignTransactionSubmitted
  | AnalyticsEventEnum.DappConnectorSignTransactionPageViewed
  | AnalyticsEventEnum.DiscoverWebViewViewed

export type DappsProperties = {
  [AnalyticsEventEnum.DiscoverPageViewed]: undefined
  [AnalyticsEventEnum.DappConnectorSignTransactionSubmitted]: undefined
  [AnalyticsEventEnum.DappConnectorSignTransactionPageViewed]: {
    asset_count: number
    asset_list: string[]
  }
  [AnalyticsEventEnum.DiscoverWebViewViewed]: undefined
}

// Receive Events
export type ReceiveEvent =
  | AnalyticsEventEnum.ReceivePageViewed
  | AnalyticsEventEnum.ReceivePageListViewed

// Wallet Management Events
export type WalletManagementEvent =
  | AnalyticsEventEnum.AllWalletsPageViewed
  | AnalyticsEventEnum.ConnectWalletCheckPageViewed
  | AnalyticsEventEnum.ConnectWalletConnectPageViewed
  | AnalyticsEventEnum.ConnectWalletDetailsPageViewed
  | AnalyticsEventEnum.ConnectWalletDetailsSubmitted
  | AnalyticsEventEnum.CreateWalletSelectMethodPageViewed
  | AnalyticsEventEnum.CreateWalletLearnPhraseStepViewed
  | AnalyticsEventEnum.CreateWalletSavePhraseStepViewed
  | AnalyticsEventEnum.CreateWalletVerifyPhraseStepViewed
  | AnalyticsEventEnum.CreateWalletDetailsSubmitted
  | AnalyticsEventEnum.RestoreWalletTypeStepViewed
  | AnalyticsEventEnum.RestoreWalletEnterPhraseStepViewed
  | AnalyticsEventEnum.RestoreWalletDetailsStepViewed

export type WalletManagementProperties = {
  [AnalyticsEventEnum.AllWalletsPageViewed]: undefined
  [AnalyticsEventEnum.ConnectWalletCheckPageViewed]: undefined
  [AnalyticsEventEnum.ConnectWalletConnectPageViewed]: undefined
  [AnalyticsEventEnum.ConnectWalletDetailsPageViewed]: undefined
  [AnalyticsEventEnum.ConnectWalletDetailsSubmitted]: {
    hardware_wallet: 'Trezor' | 'Ledger'
  }
  [AnalyticsEventEnum.CreateWalletSelectMethodPageViewed]: undefined
  [AnalyticsEventEnum.CreateWalletLearnPhraseStepViewed]: undefined
  [AnalyticsEventEnum.CreateWalletSavePhraseStepViewed]: undefined
  [AnalyticsEventEnum.CreateWalletVerifyPhraseStepViewed]: undefined
  [AnalyticsEventEnum.CreateWalletDetailsSubmitted]: undefined
  [AnalyticsEventEnum.RestoreWalletTypeStepViewed]: undefined
  [AnalyticsEventEnum.RestoreWalletEnterPhraseStepViewed]: undefined
  [AnalyticsEventEnum.RestoreWalletDetailsStepViewed]: undefined
}

// Catalyst Voting Events
export type CatalystVotingEvent = AnalyticsEventEnum.VotingPageViewed

// Settings Events
export type SettingsEvent = AnalyticsEventEnum.SettingsPageViewed

// Landing Events
export type LandingEvent = AnalyticsEventEnum.TransactionsPageViewed

// Union of all events
export type AnalyticsEvent =
  | OnboardingEvent
  | SendEvent
  | TransactionReviewEvent
  | StakingEvent
  | GovernanceEvent
  | FiatRampEvent
  | SwapEvent
  | PortfolioEvent
  | NFTEvent
  | DappsEvent
  | ReceiveEvent
  | WalletManagementEvent
  | CatalystVotingEvent
  | SettingsEvent
  | LandingEvent

// Properties for events that need them
export type AnalyticsEventProperties = TransactionReviewProperties &
  NFTProperties &
  DappsProperties &
  WalletManagementProperties & {
    // Events without properties
    [K in Exclude<
      AnalyticsEvent,
      keyof (TransactionReviewProperties &
        NFTProperties &
        DappsProperties &
        WalletManagementProperties)
    >]: undefined
  }
