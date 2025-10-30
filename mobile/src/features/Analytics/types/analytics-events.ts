import {AnalyticsEventEnum} from './analytics-event-enum'

export type OnboardingEvent =
  | AnalyticsEventEnum.OnboardingPinCodePageViewed
  | AnalyticsEventEnum.OnboardingBiometricsPageViewed
  | AnalyticsEventEnum.OnboardingThemePageViewed

export type SendEvent =
  | AnalyticsEventEnum.SendInitiated
  | AnalyticsEventEnum.SendSelectAssetPageViewed

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

export type StakingEvent = AnalyticsEventEnum.StakingCenterPageViewed

export type GovernanceEvent = AnalyticsEventEnum.GovernanceDashboardPageViewed

export type FiatRampEvent =
  | AnalyticsEventEnum.WalletPageBuyBannerClicked
  | AnalyticsEventEnum.WalletPageExchangeClicked

export type SwapEvent =
  | AnalyticsEventEnum.SwapInitiated
  | AnalyticsEventEnum.SwapReviewPageViewed

export type PortfolioEvent =
  | AnalyticsEventEnum.PortfolioDashboardPageViewed
  | AnalyticsEventEnum.PortfolioTokensListPageViewed

export type NFTEvent =
  | AnalyticsEventEnum.NFTGalleryPageViewed
  | AnalyticsEventEnum.NFTGalleryDetailsPageViewed

export type NFTProperties = {
  [AnalyticsEventEnum.NFTGalleryPageViewed]: {
    nft_count: number
  }
  [AnalyticsEventEnum.NFTGalleryDetailsPageViewed]: undefined
}

export type DappsEvent =
  | AnalyticsEventEnum.DiscoverPageViewed
  | AnalyticsEventEnum.DiscoverWebViewViewed

export type DappsProperties = {
  [AnalyticsEventEnum.DiscoverPageViewed]: undefined
  [AnalyticsEventEnum.DiscoverWebViewViewed]: undefined
}

export type ReceiveEvent =
  | AnalyticsEventEnum.ReceivePageViewed
  | AnalyticsEventEnum.ReceivePageListViewed

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

export type CatalystVotingEvent = AnalyticsEventEnum.VotingPageViewed

export type SettingsEvent = AnalyticsEventEnum.SettingsPageViewed

export type LandingEvent = AnalyticsEventEnum.TransactionsPageViewed

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

export type AnalyticsEventProperties = TransactionReviewProperties &
  NFTProperties &
  DappsProperties &
  WalletManagementProperties & {
    [K in Exclude<
      AnalyticsEvent,
      keyof (TransactionReviewProperties &
        NFTProperties &
        DappsProperties &
        WalletManagementProperties)
    >]: undefined
  }
