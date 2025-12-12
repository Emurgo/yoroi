import {AnalyticsEventEnum} from '../types/analytics-event-enum'
import type {RouteToEventMap} from '../types/route-events'

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
  'wallet-settings': AnalyticsEventEnum.SettingsPageViewed,
  'choose-biometric-login': AnalyticsEventEnum.OnboardingBiometricsPageViewed,
  'dark-theme-announcement': AnalyticsEventEnum.OnboardingThemePageViewed,
  'enable-login-with-pin': AnalyticsEventEnum.OnboardingPinCodePageViewed,
  'result-screen': {
    event: AnalyticsEventEnum.TransactionResultsPopupViewed,
    properties: {status: 'Success'},
  },
}
