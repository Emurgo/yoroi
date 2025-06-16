import {time, useSyncStorageToState} from '@yoroi/common'
import {App} from '@yoroi/types'

import {freeze} from 'immer'
import * as React from 'react'

import {buildVariant} from '../constants'
import {logger} from '../logger/logger'
import {
  metricsConsentRequestedStorageKeyManager,
  metricsEnabledStorageKeyManager,
} from '../storage/storages'
import {Ampli, ampli} from './ampli'
import {mockMetricsManager} from './mocks'

const environment =
  buildVariant === 'NIGHTLY' || buildVariant === 'PROD'
    ? 'production'
    : 'development'

const metricsStorageMaker = ({
  enabled,
  consentRequested,
}: {
  enabled: Readonly<App.StorageKeyManager<boolean>>
  consentRequested: Readonly<App.StorageKeyManager<boolean>>
}) => {
  return freeze(
    {
      enabled,
      consentRequested,
    } as const,
    true,
  )
}
type MetricsStorage = ReturnType<typeof metricsStorageMaker>

export const makeMetricsManager = (
  metricsStorage: MetricsStorage = metricsStorageMaker({
    enabled: metricsEnabledStorageKeyManager,
    consentRequested: metricsConsentRequestedStorageKeyManager,
  }),
  metricsModule: Ampli = ampli,
) => {
  const disable = async () => {
    logger.debug('disable', {origin: 'metricsManager'})
    metricsStorage.enabled.save(false)
    await metricsModule.flush().promise
    metricsModule.client.setOptOut(true)
  }
  const enable = () => {
    logger.debug('enable', {origin: 'metricsManager'})
    metricsStorage.enabled.save(true)
    metricsModule.client.setOptOut(false)
  }

  const init = async () => {
    const isEnabled = metricsStorage.enabled.read()
    if (!metricsModule.isLoaded) {
      await metricsModule
        .load({
          environment,
          client: {
            configuration: {
              optOut: !isEnabled,
              flushIntervalMillis: flushIntervalMs,
              trackingOptions: {
                ipAddress: false,
              },
            },
          },
          disabled: !isEnabled,
        })
        .promise.then(() => {
          if (environment === 'development') {
            metricsModule.client.add({
              name: 'info-plugin',
              type: 'enrichment',
              setup: async () => Promise.resolve(),
              execute: async (event) => {
                return Promise.resolve(event)
              },
            })
          }
        })
        .catch((error: unknown) => {
          logger.error('failed:', {
            error,
            origin: 'metricsManager.init',
          })
        })
    }
  }

  const track = {
    allWalletsPageViewed:
      metricsModule.allWalletsPageViewed.bind(metricsModule),
    assetsPageViewed: metricsModule.assetsPageViewed.bind(metricsModule),
    menuPageViewed: metricsModule.menuPageViewed.bind(metricsModule),
    settingsPageViewed: metricsModule.settingsPageViewed.bind(metricsModule),
    stakingCenterPageViewed:
      metricsModule.stakingCenterPageViewed.bind(metricsModule),
    transactionsPageViewed:
      metricsModule.transactionsPageViewed.bind(metricsModule),
    votingPageViewed: metricsModule.votingPageViewed.bind(metricsModule),
    walletPageViewed: metricsModule.walletPageViewed.bind(metricsModule),

    nftGalleryDetailsTab:
      metricsModule.nftGalleryDetailsTab.bind(metricsModule),
    nftGalleryPageViewed:
      metricsModule.nftGalleryPageViewed.bind(metricsModule),
    nftGallerySearchActivated:
      metricsModule.nftGallerySearchActivated.bind(metricsModule),
    nftGalleryDetailsPageViewed:
      metricsModule.nftGalleryDetailsPageViewed.bind(metricsModule),
    nftGalleryDetailsImageViewed:
      metricsModule.nftGalleryDetailsImageViewed.bind(metricsModule),

    sendInitiated: metricsModule.sendInitiated.bind(metricsModule),
    sendSelectAssetPageViewed:
      metricsModule.sendSelectAssetPageViewed.bind(metricsModule),
    sendSelectAssetSelected:
      metricsModule.sendSelectAssetSelected.bind(metricsModule),
    sendSelectAssetUpdated:
      metricsModule.sendSelectAssetUpdated.bind(metricsModule),
    sendSummaryPageViewed:
      metricsModule.sendSummaryPageViewed.bind(metricsModule),
    sendSummarySubmitted:
      metricsModule.sendSummarySubmitted.bind(metricsModule),

    swapInitiated: metricsModule.swapInitiated.bind(metricsModule),
    swapPoolChanged: metricsModule.swapPoolChanged.bind(metricsModule),
    swapOrderSelected: metricsModule.swapOrderSelected.bind(metricsModule),
    swapAssetToChanged: metricsModule.swapAssetToChanged.bind(metricsModule),
    swapOrderSubmitted: metricsModule.swapOrderSubmitted.bind(metricsModule),
    swapSlippageChanged: metricsModule.swapSlippageChanged.bind(metricsModule),
    swapAssetFromChanged:
      metricsModule.swapAssetFromChanged.bind(metricsModule),
    swapConfirmedPageViewed:
      metricsModule.swapConfirmedPageViewed.bind(metricsModule),
    swapCancelationSubmitted:
      metricsModule.swapCancelationSubmitted.bind(metricsModule),

    walletPageExchangeClicked:
      metricsModule.walletPageExchangeClicked.bind(metricsModule),
    walletPageBuyBannerClicked:
      metricsModule.walletPageBuyBannerClicked.bind(metricsModule),

    exchangePageViewed: metricsModule.exchangePageViewed.bind(metricsModule),
    exchangeSubmitted: metricsModule.exchangeSubmitted.bind(metricsModule),

    governanceChooseDrepPageViewed:
      metricsModule.governanceChooseDrepPageViewed.bind(metricsModule),
    governanceConfirmTransactionPageViewed:
      metricsModule.governanceConfirmTransactionPageViewed.bind(metricsModule),
    governanceDashboardPageViewed:
      metricsModule.governanceDashboardPageViewed.bind(metricsModule),
    governanceTransactionSuccessPageViewed:
      metricsModule.governanceTransactionSuccessPageViewed.bind(metricsModule),

    createWalletDetailsSettled:
      metricsModule.createWalletDetailsSettled.bind(metricsModule),
    createWalletDetailsStepViewed:
      metricsModule.createWalletDetailsStepViewed.bind(metricsModule),
    createWalletDetailsSubmitted:
      metricsModule.createWalletDetailsSubmitted.bind(metricsModule),
    createWalletLanguagePageViewed:
      metricsModule.createWalletLanguagePageViewed.bind(metricsModule),
    createWalletLearnPhraseStepViewed:
      metricsModule.createWalletLearnPhraseStepViewed.bind(metricsModule),
    createWalletSavePhraseStepViewed:
      metricsModule.createWalletSavePhraseStepViewed.bind(metricsModule),
    createWalletSelectMethodPageViewed:
      metricsModule.createWalletSelectMethodPageViewed.bind(metricsModule),
    createWalletTermsPageViewed:
      metricsModule.createWalletTermsPageViewed.bind(metricsModule),
    createWalletVerifyPhraseStepViewed:
      metricsModule.createWalletVerifyPhraseStepViewed.bind(metricsModule),
    createWalletVerifyPhraseWordSelected:
      metricsModule.createWalletVerifyPhraseWordSelected.bind(metricsModule),

    restoreWalletDetailsSettled:
      metricsModule.restoreWalletDetailsSettled.bind(metricsModule),
    restoreWalletDetailsStepViewed:
      metricsModule.restoreWalletDetailsStepViewed.bind(metricsModule),
    restoreWalletEnterPhraseStepStatus:
      metricsModule.restoreWalletEnterPhraseStepStatus.bind(metricsModule),
    restoreWalletEnterPhraseStepViewed:
      metricsModule.restoreWalletEnterPhraseStepViewed.bind(metricsModule),
    restoreWalletTypeStepViewed:
      metricsModule.restoreWalletTypeStepViewed.bind(metricsModule),

    receiveAmountGeneratedPageViewed:
      metricsModule.receiveAmountGeneratedPageViewed.bind(metricsModule),
    receiveAmountPageViewed:
      metricsModule.receiveAmountPageViewed.bind(metricsModule),
    receiveCopyAddressClicked:
      metricsModule.receiveCopyAddressClicked.bind(metricsModule),
    receiveGenerateNewAddressClicked:
      metricsModule.receiveGenerateNewAddressClicked.bind(metricsModule),
    receivePageListViewed:
      metricsModule.receivePageListViewed.bind(metricsModule),
    receiveShareAddressClicked:
      metricsModule.receiveShareAddressClicked.bind(metricsModule),
    receivePageViewed: metricsModule.receivePageViewed.bind(metricsModule),

    portfolioDashboardPageViewed:
      metricsModule.portfolioDashboardPageViewed.bind(metricsModule),
    portfolioTokenDetails:
      metricsModule.portfolioTokenDetails.bind(metricsModule),
    portfolioTokensListPageViewed:
      metricsModule.portfolioTokensListPageViewed.bind(metricsModule),
    portfolioTokensListSearchActivated:
      metricsModule.portfolioTokensListSearchActivated.bind(metricsModule),

    discoverConnectedBottomSheetDisconnectClicked:
      metricsModule.discoverConnectedBottomSheetDisconnectClicked.bind(
        metricsModule,
      ),
    discoverConnectedBottomSheetOpenDAppClicked:
      metricsModule.discoverConnectedBottomSheetOpenDAppClicked.bind(
        metricsModule,
      ),
    discoverConnectedDAppItemClicked:
      metricsModule.discoverConnectedDAppItemClicked.bind(metricsModule),
    discoverDAppItemClicked:
      metricsModule.discoverDAppItemClicked.bind(metricsModule),
    discoverFilterSelected:
      metricsModule.discoverFilterSelected.bind(metricsModule),
    discoverPageViewed: metricsModule.discoverPageViewed.bind(metricsModule),
    discoverSearchActivated:
      metricsModule.discoverSearchActivated.bind(metricsModule),
    discoverWebViewBottomSheetConnectClicked:
      metricsModule.discoverWebViewBottomSheetConnectClicked.bind(
        metricsModule,
      ),
    discoverWebViewCloseClicked:
      metricsModule.discoverWebViewCloseClicked.bind(metricsModule),
    discoverWebViewTabBarBackwardClicked:
      metricsModule.discoverWebViewTabBarBackwardClicked.bind(metricsModule),
    discoverWebViewTabBarForwardClicked:
      metricsModule.discoverWebViewTabBarForwardClicked.bind(metricsModule),
    discoverWebViewTabBarRefreshClicked:
      metricsModule.discoverWebViewTabBarRefreshClicked.bind(metricsModule),
    discoverWebViewTabBarShareClicked:
      metricsModule.discoverWebViewTabBarShareClicked.bind(metricsModule),
    discoverWebViewTabClicked:
      metricsModule.discoverWebViewTabClicked.bind(metricsModule),
    discoverWebViewToolbarSearchActivated:
      metricsModule.discoverWebViewToolbarSearchActivated.bind(metricsModule),
    discoverWebViewViewed:
      metricsModule.discoverWebViewViewed.bind(metricsModule),

    networkSelected: metricsModule.networkSelected.bind(metricsModule),

    inAppNotificationOpened:
      metricsModule.inAppNotificationOpened.bind(metricsModule),
    inAppNotificationViewed:
      metricsModule.inAppNotificationViewed.bind(metricsModule),
    inAppNotificationClosed:
      metricsModule.inAppNotificationClosed.bind(metricsModule),
    settingsInAppNotificationsStatusUpdated:
      metricsModule.settingsInAppNotificationsStatusUpdated.bind(metricsModule),

    onboardingPinCodePageViewed:
      metricsModule.onboardingPinCodePageViewed.bind(metricsModule),
    onboardingBiometricsPageViewed:
      metricsModule.onboardingBiometricsPageViewed.bind(metricsModule),
    onboardingThemePageViewed:
      metricsModule.onboardingThemePageViewed.bind(metricsModule),

    connectWalletCheckPageViewed:
      metricsModule.connectWalletCheckPageViewed.bind(metricsModule),
    connectWalletConnectPageViewed:
      metricsModule.connectWalletConnectPageViewed.bind(metricsModule),
    connectWalletDetailsPageViewed:
      metricsModule.connectWalletDetailsPageViewed.bind(metricsModule),
    connectWalletDetailsSubmitted:
      metricsModule.connectWalletDetailsSubmitted.bind(metricsModule),

    stakingCenterDelegationInitiated:
      metricsModule.stakingCenterDelegationInitiated.bind(metricsModule),
    stakingCenterDelegationSubmitted:
      metricsModule.stakingCenterDelegationSubmitted.bind(metricsModule),

    claimAdaTransactionInitiated:
      metricsModule.claimAdaTransactionInitiated.bind(metricsModule),
    claimAdaTransactionSubmitted:
      metricsModule.claimAdaTransactionSubmitted.bind(metricsModule),

    themeSelected: metricsModule.themeSelected.bind(metricsModule),
    dappPopupSignTransactionPageViewed:
      metricsModule.dappPopupSignTransactionPageViewed.bind(metricsModule),

    buyAdaSuccessRedirect:
      metricsModule.buyAdaSuccessRedirect.bind(metricsModule),
    claimAdaTransactionSettled:
      metricsModule.claimAdaTransactionSettled.bind(metricsModule),
    dappPopupSignTransactionSubmitted:
      metricsModule.dappPopupSignTransactionSubmitted.bind(metricsModule),
    onboardingAnalyticsPageViewed:
      metricsModule.onboardingAnalyticsPageViewed.bind(metricsModule),
    sellAdaInputAmount: metricsModule.sellAdaInputAmount.bind(metricsModule),
    sellAdaSuccessRedirect:
      metricsModule.sellAdaSuccessRedirect.bind(metricsModule),
    walletPageExchangeBottomSheetClicked:
      metricsModule.walletPageExchangeBottomSheetClicked.bind(metricsModule),

    notificationCenterPageViewed:
      metricsModule.notificationCenterPageViewed.bind(metricsModule),
    pushNotificationPressed:
      metricsModule.pushNotificationPressed.bind(metricsModule),
    pushNotificationViewed:
      metricsModule.pushNotificationViewed.bind(metricsModule),
    settingInAppNotificationTimerUpdated:
      metricsModule.settingInAppNotificationTimerUpdated.bind(metricsModule),
    settingsPushNotificationsStatusUpdated:
      metricsModule.settingsPushNotificationsStatusUpdated.bind(metricsModule),
  } as const

  return {
    init,
    track,
    enable,
    disable,
  } as const
}

export type MetricsManager = ReturnType<typeof makeMetricsManager>
type MetricsManagerContext = Omit<MetricsManager, 'enable' | 'disable'> &
  Readonly<{
    enable: () => void
    disable: () => void
    requestConsent: () => void
    resetConsent: () => void
  }>
type MetricsState = Readonly<{
  isLoaded: boolean
  isEnabled: boolean
  isConsentRequested: boolean
}>
type MetricsContextType = MetricsManagerContext & MetricsState

const defaultState: MetricsState = {
  isLoaded: false,
  isEnabled: false,
  isConsentRequested: false,
} as const
const defaultManager: MetricsManager = mockMetricsManager()
const MetricsContext = React.createContext<MetricsContextType>({
  ...defaultState,
  ...defaultManager,
  requestConsent: () => {},
  resetConsent: () => {},
})
export const MetricsProvider = ({
  children,
  metricsManager,
}: {
  children: React.ReactNode
  metricsManager: MetricsManager
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [isEnabled] = useSyncStorageToState(metricsEnabledStorageKeyManager)
  const [isConsentRequested, setConsentRequested] = useSyncStorageToState(
    metricsConsentRequestedStorageKeyManager,
  )

  React.useEffect(() => {
    metricsManager
      .init()
      .catch((error) => {
        logger.error('metricsManager init failed', {
          error,
          origin: 'metricsManager',
        })
      })
      .finally(() => {
        setIsLoaded(true)
      })
  }, [metricsManager])

  const context = React.useMemo(
    () => ({
      ...metricsManager,
      isEnabled,
      isConsentRequested,
      isLoaded,
      enable: () => metricsManager.enable(),
      disable: () => metricsManager.disable(),
      requestConsent: () => setConsentRequested(true),
      resetConsent: () => setConsentRequested(false),
    }),
    [
      metricsManager,
      setConsentRequested,
      isEnabled,
      isConsentRequested,
      isLoaded,
    ],
  )

  if (!isLoaded) return null

  return (
    <MetricsContext.Provider value={context}>
      {children}
    </MetricsContext.Provider>
  )
}

export const useMetrics = () => React.useContext(MetricsContext)

const flushIntervalMs = time.seconds(5)
