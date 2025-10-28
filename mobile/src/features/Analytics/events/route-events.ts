import type {AnalyticsEvent, AnalyticsEventProperties} from './analytics-events'

export enum AnalyticsEventEnum {
  AllWalletsPageViewed = 'All Wallets Page Viewed',
  CreateWalletSelectMethodPageViewed = 'Create Wallet Select Method Page Viewed',
  RestoreWalletTypeStepViewed = 'Restore Wallet Type Step Viewed',
  CreateWalletLearnPhraseStepViewed = 'Create Wallet Learn Phrase Step Viewed',
  CreateWalletSavePhraseStepViewed = 'Create Wallet Save Phrase Step Viewed',
  CreateWalletVerifyPhraseStepViewed = 'Create Wallet Verify Phrase Step Viewed',
  RestoreWalletEnterPhraseStepViewed = 'Restore Wallet Enter Phrase Step Viewed',
  RestoreWalletDetailsStepViewed = 'Restore Wallet Details Step Viewed',
  ConnectWalletCheckPageViewed = 'Connect Wallet Check Page Viewed',
  ConnectWalletConnectPageViewed = 'Connect Wallet Connect Page Viewed',
  ConnectWalletDetailsPageViewed = 'Connect Wallet Details Page Viewed',
  TransactionsPageViewed = 'Transactions Page Viewed',
  ReceivePageViewed = 'Receive Page Viewed',
  ReceivePageListViewed = 'Receive Page List Viewed',
  PortfolioTokensListPageViewed = 'Portfolio Tokens List Page Viewed',
  PortfolioDashboardPageViewed = 'Portfolio Dashboard Page Viewed',
  NFTGalleryPageViewed = 'NFT Gallery Page Viewed',
  NFTGalleryDetailsPageViewed = 'NFT Gallery Details Page Viewed',
  DiscoverPageViewed = 'Discover Page Viewed',
  DiscoverWebViewViewed = 'Discover Web View Viewed',
  SwapInitiated = 'Swap Initiated',
  SwapReviewPageViewed = 'Swap Review Page Viewed',
  SendInitiated = 'Send Initiated',
  SendSelectAssetPageViewed = 'Send Select Asset Page Viewed',
  StakingCenterPageViewed = 'Staking Center Page Viewed',
  GovernanceDashboardPageViewed = 'Governance Dashboard Page Viewed',
  VotingPageViewed = 'Voting Page Viewed',
  OnboardingBiometricsPageViewed = 'Onboarding Biometrics Page Viewed',
  OnboardingThemePageViewed = 'Onboarding Theme Page Viewed',
  OnboardingPinCodePageViewed = 'Onboarding Pin Code Page Viewed',
  TransactionResultsPopupViewed = 'Transaction Results Popup Viewed',
}

type TransactionResultsProps =
  AnalyticsEventProperties['Transaction Results Popup Viewed']

export type RouteToEventMap = Record<
  string,
  | AnalyticsEvent
  | {
      event: AnalyticsEvent
      properties?: TransactionResultsProps | undefined
    }
  | undefined
>

export const routeToEvent: RouteToEventMap = {
  'wallet-selection': AnalyticsEventEnum.AllWalletsPageViewed,
  'manage-wallets': AnalyticsEventEnum.AllWalletsPageViewed,
  'setup-wallet-choose-setup-type-init':
    AnalyticsEventEnum.CreateWalletSelectMethodPageViewed,
  'setup-wallet-choose-setup-type':
    AnalyticsEventEnum.CreateWalletSelectMethodPageViewed,
  'setup-wallet-restore-choose-mnemonic-type':
    AnalyticsEventEnum.RestoreWalletTypeStepViewed,
  'setup-wallet-about-recovery-phase':
    AnalyticsEventEnum.CreateWalletLearnPhraseStepViewed,
  'setup-wallet-recovery-phrase-mnemonic':
    AnalyticsEventEnum.CreateWalletSavePhraseStepViewed,
  'setup-wallet-verify-recovery-phrase-mnemonic':
    AnalyticsEventEnum.CreateWalletVerifyPhraseStepViewed,
  'setup-wallet-restore-form':
    AnalyticsEventEnum.RestoreWalletEnterPhraseStepViewed,
  'setup-wallet-restore-details':
    AnalyticsEventEnum.RestoreWalletDetailsStepViewed,
  'setup-wallet-check-nano-x': AnalyticsEventEnum.ConnectWalletCheckPageViewed,
  'setup-wallet-connect-nano-x':
    AnalyticsEventEnum.ConnectWalletConnectPageViewed,
  'setup-wallet-save-nano-x': AnalyticsEventEnum.ConnectWalletDetailsPageViewed,
  'history-list': AnalyticsEventEnum.TransactionsPageViewed,
  'receive-single': AnalyticsEventEnum.ReceivePageViewed,
  'receive-multiple': AnalyticsEventEnum.ReceivePageListViewed,
  'portfolio-tokens-list': AnalyticsEventEnum.PortfolioTokensListPageViewed,
  'dashboard-portfolio': AnalyticsEventEnum.PortfolioDashboardPageViewed,
  'nft-gallery': AnalyticsEventEnum.NFTGalleryPageViewed,
  'nft-details': AnalyticsEventEnum.NFTGalleryDetailsPageViewed,
  'discover-select-dapp-from-list': AnalyticsEventEnum.DiscoverPageViewed,
  'discover-browse-dapp': AnalyticsEventEnum.DiscoverWebViewViewed,
  'main': AnalyticsEventEnum.SwapInitiated,
  'review': AnalyticsEventEnum.SwapReviewPageViewed,
  'send-start-tx': AnalyticsEventEnum.SendInitiated,
  'send-select-token-from-list': AnalyticsEventEnum.SendSelectAssetPageViewed,
  'staking-center': AnalyticsEventEnum.StakingCenterPageViewed,
  'staking-gov-home': AnalyticsEventEnum.GovernanceDashboardPageViewed,
  'staking-gov-change-vote': AnalyticsEventEnum.GovernanceDashboardPageViewed,
  'download-catalyst': AnalyticsEventEnum.VotingPageViewed,
  'choose-biometric-login': AnalyticsEventEnum.OnboardingBiometricsPageViewed,
  'dark-theme-announcement': AnalyticsEventEnum.OnboardingThemePageViewed,
  'enable-login-with-pin': AnalyticsEventEnum.OnboardingPinCodePageViewed,
  'review-tx-submitted-tx': {
    event: AnalyticsEventEnum.TransactionResultsPopupViewed,
    properties: {status: 'Success'},
  },
  'review-tx-failed-tx': {
    event: AnalyticsEventEnum.TransactionResultsPopupViewed,
    properties: {status: 'Failure'},
  },
  'send-submitted-tx': {
    event: AnalyticsEventEnum.TransactionResultsPopupViewed,
    properties: {status: 'Success'},
  },
  'send-failed-tx': {
    event: AnalyticsEventEnum.TransactionResultsPopupViewed,
    properties: {status: 'Failure'},
  },
  'staking-submitted-tx': {
    event: AnalyticsEventEnum.TransactionResultsPopupViewed,
    properties: {status: 'Success'},
  },
  'staking-failed-tx': {
    event: AnalyticsEventEnum.TransactionResultsPopupViewed,
    properties: {status: 'Failure'},
  },
  'staking-gov-submitted-tx': {
    event: AnalyticsEventEnum.TransactionResultsPopupViewed,
    properties: {status: 'Success'},
  },
  'staking-gov-failed-tx': {
    event: AnalyticsEventEnum.TransactionResultsPopupViewed,
    properties: {status: 'Failure'},
  },
}
