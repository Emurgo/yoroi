/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {MetricsManager} from './metricsManager'

export const mockMetricsManager = (): MetricsManager => {
  const disable = () => Promise.resolve()
  const enable = () => Promise.resolve()
  const enabled = () => Promise.resolve(true)
  const consentRequested = () => Promise.resolve(false)
  const requestConsent = () => Promise.resolve()
  const resetConsent = () => Promise.resolve()

  const init = () => Promise.resolve()
  const track = {
    allWalletsPageViewed: e,
    assetsPageViewed: e,
    menuPageViewed: e,
    settingsPageViewed: e,
    stakingCenterPageViewed: e,
    transactionsPageViewed: e,
    votingPageViewed: e,
    walletPageViewed: e,

    nftGalleryDetailsTab: e,
    nftGalleryPageViewed: e,
    nftGallerySearchActivated: e,
    nftGalleryDetailsPageViewed: e,
    nftGalleryDetailsImageViewed: e,

    sendInitiated: e,
    sendSelectAssetPageViewed: e,
    sendSelectAssetSelected: e,
    sendSelectAssetUpdated: e,
    sendSummaryPageViewed: e,
    sendSummarySubmitted: e,

    swapInitiated: e,
    swapPoolChanged: e,
    swapOrderSelected: e,
    swapAssetToChanged: e,
    swapOrderSubmitted: e,
    swapSlippageChanged: e,
    swapAssetFromChanged: e,
    swapConfirmedPageViewed: e,
    swapCancelationSubmitted: e,

    walletPageExchangeClicked: e,
    walletPageBuyBannerClicked: e,

    exchangePageViewed: e,
    exchangeSubmitted: e,

    governanceChooseDrepPageViewed: e,
    governanceConfirmTransactionPageViewed: e,
    governanceDashboardPageViewed: e,
    governanceTransactionSuccessPageViewed: e,

    createWalletDetailsSettled: e,
    createWalletDetailsStepViewed: e,
    createWalletDetailsSubmitted: e,
    createWalletLanguagePageViewed: e,
    createWalletLearnPhraseStepViewed: e,
    createWalletSavePhraseStepViewed: e,
    createWalletSelectMethodPageViewed: e,
    createWalletTermsPageViewed: e,
    createWalletVerifyPhraseStepViewed: e,
    createWalletVerifyPhraseWordSelected: e,

    restoreWalletDetailsSettled: e,
    restoreWalletDetailsStepViewed: e,
    restoreWalletEnterPhraseStepStatus: e,
    restoreWalletEnterPhraseStepViewed: e,
    restoreWalletTypeStepViewed: e,

    receiveAmountGeneratedPageViewed: e,
    receiveAmountPageViewed: e,
    receiveCopyAddressClicked: e,
    receiveGenerateNewAddressClicked: e,
    receivePageListViewed: e,
    receiveShareAddressClicked: e,
    receivePageViewed: e,

    portfolioDashboardPageViewed: e,
    portfolioTokenDetails: e,
    portfolioTokensListPageViewed: e,
    portfolioTokensListSearchActivated: e,
  } as const

  return {
    init,
    track,
    enable,
    disable,
    enabled,
    consentRequested,
    requestConsent,
    resetConsent,
  } as const
}

const e = (event: any, options?: any): any => void 0
