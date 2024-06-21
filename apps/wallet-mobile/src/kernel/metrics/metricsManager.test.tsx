/* eslint-disable @typescript-eslint/require-await */
import {act, render} from '@testing-library/react-native'
import * as React from 'react'
import {Text, View} from 'react-native'

import {Ampli} from './ampli'
import {makeMetricsManager, MetricsProvider, useMetrics} from './metricsManager'
import {mockMetricsManager} from './mocks'

const initialMockedMetricsManager = mockMetricsManager()

jest.useFakeTimers()

const TestInit = () => {
  const {isLoaded} = useMetrics()

  return (
    <View>
      <Text>{isLoaded ? 'Loaded' : 'Not Loaded'}</Text>
    </View>
  )
}

describe('MetricsProvider', () => {
  it('should initialize the module while mounting', async () => {
    const metricsManager = {...initialMockedMetricsManager, init: jest.fn(), enabled: jest.fn()}
    const {findByText} = render(
      <MetricsProvider metricsManager={metricsManager}>
        <TestInit />
      </MetricsProvider>,
    )

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(await findByText('Loaded')).toBeTruthy()
    expect(metricsManager.init).toHaveBeenCalled()
    expect(metricsManager.enabled).toHaveBeenCalled()
  })
})

const mockAmpli = {
  load: jest.fn().mockReturnValue({promise: Promise.resolve()}),
  client: {
    setOptOut: jest.fn(),
  },
  flush: jest.fn().mockReturnValue({promise: Promise.resolve()}),
  isLoaded: false,

  allWalletsPageViewed: jest.fn(),
  assetsPageViewed: jest.fn(),
  menuPageViewed: jest.fn(),
  settingsPageViewed: jest.fn(),
  stakingCenterPageViewed: jest.fn(),
  transactionsPageViewed: jest.fn(),
  votingPageViewed: jest.fn(),
  walletPageViewed: jest.fn(),

  nftGalleryDetailsTab: jest.fn(),
  nftGalleryPageViewed: jest.fn(),
  nftGallerySearchActivated: jest.fn(),
  nftGalleryDetailsPageViewed: jest.fn(),
  nftGalleryDetailsImageViewed: jest.fn(),

  sendInitiated: jest.fn(),
  sendSelectAssetPageViewed: jest.fn(),
  sendSelectAssetSelected: jest.fn(),
  sendSelectAssetUpdated: jest.fn(),
  sendSummaryPageViewed: jest.fn(),
  sendSummarySubmitted: jest.fn(),

  swapInitiated: jest.fn(),
  swapPoolChanged: jest.fn(),
  swapOrderSelected: jest.fn(),
  swapAssetToChanged: jest.fn(),
  swapOrderSubmitted: jest.fn(),
  swapSlippageChanged: jest.fn(),
  swapAssetFromChanged: jest.fn(),
  swapConfirmedPageViewed: jest.fn(),
  swapCancelationSubmitted: jest.fn(),

  walletPageExchangeClicked: jest.fn(),
  walletPageBuyBannerClicked: jest.fn(),

  exchangePageViewed: jest.fn(),
  exchangeSubmitted: jest.fn(),

  governanceChooseDrepPageViewed: jest.fn(),
  governanceConfirmTransactionPageViewed: jest.fn(),
  governanceDashboardPageViewed: jest.fn(),
  governanceTransactionSuccessPageViewed: jest.fn(),

  createWalletDetailsSettled: jest.fn(),
  createWalletDetailsStepViewed: jest.fn(),
  createWalletDetailsSubmitted: jest.fn(),
  createWalletLanguagePageViewed: jest.fn(),
  createWalletLearnPhraseStepViewed: jest.fn(),
  createWalletSavePhraseStepViewed: jest.fn(),
  createWalletSelectMethodPageViewed: jest.fn(),
  createWalletTermsPageViewed: jest.fn(),
  createWalletVerifyPhraseStepViewed: jest.fn(),
  createWalletVerifyPhraseWordSelected: jest.fn(),

  restoreWalletDetailsSettled: jest.fn(),
  restoreWalletDetailsStepViewed: jest.fn(),
  restoreWalletEnterPhraseStepStatus: jest.fn(),
  restoreWalletEnterPhraseStepViewed: jest.fn(),
  restoreWalletTypeStepViewed: jest.fn(),

  receiveAmountGeneratedPageViewed: jest.fn(),
  receiveAmountPageViewed: jest.fn(),
  receiveCopyAddressClicked: jest.fn(),
  receiveGenerateNewAddressClicked: jest.fn(),
  receivePageListViewed: jest.fn(),
  receiveShareAddressClicked: jest.fn(),
  receivePageViewed: jest.fn(),

  portfolioDashboardPageViewed: jest.fn(),
  portfolioTokenDetails: jest.fn(),
  portfolioTokensListPageViewed: jest.fn(),
  portfolioTokensListSearchActivated: jest.fn(),

  discoverConnectedBottomSheetDisconnectClicked: jest.fn(),
  discoverConnectedBottomSheetOpenDAppClicked: jest.fn(),
  discoverConnectedDAppItemClicked: jest.fn(),
  discoverDAppItemClicked: jest.fn(),
  discoverFilterSelected: jest.fn(),
  discoverPageViewed: jest.fn(),
  discoverSearchActivated: jest.fn(),
  discoverWebViewBottomSheetConnectClicked: jest.fn(),
  discoverWebViewCloseClicked: jest.fn(),
  discoverWebViewTabBarBackwardClicked: jest.fn(),
  discoverWebViewTabBarForwardClicked: jest.fn(),
  discoverWebViewTabBarRefreshClicked: jest.fn(),
  discoverWebViewTabBarShareClicked: jest.fn(),
  discoverWebViewTabClicked: jest.fn(),
  discoverWebViewToolbarSearchActivated: jest.fn(),
  discoverWebViewViewed: jest.fn(),
} as unknown as Ampli

const mockMetricsStorage = {
  enabled: {
    read: jest.fn().mockResolvedValue(true),
    write: jest.fn().mockResolvedValue(undefined),
  },
  consentRequested: {
    read: jest.fn().mockResolvedValue(false),
    write: jest.fn().mockResolvedValue(undefined),
  },
}

describe('makeMetricsManager', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('init should initialize metricsModule with the correct environment and enabled status', async () => {
    const metricsManager = makeMetricsManager(mockMetricsStorage, mockAmpli)

    expect(await metricsManager.enabled()).toBe(true)
    await metricsManager.init()

    expect(mockAmpli.load).toHaveBeenCalledWith({
      environment: 'development',
      client: {
        configuration: {optOut: false, flushIntervalMillis: expect.any(Number), trackingOptions: {ipAddress: false}},
      },
    })
  })

  test('init should do nothing if it was loaded already', async () => {
    const mockAmpliLoaded = {...mockAmpli, isLoaded: true} as unknown as Ampli
    const metricsManager = makeMetricsManager(mockMetricsStorage, mockAmpliLoaded)

    expect(await metricsManager.enabled()).toBe(true)
    await metricsManager.init()

    expect(mockAmpliLoaded.load).toHaveBeenCalledTimes(0)
  })

  test('track should call the appropriate metricsModule methods', () => {
    const metricsManager = makeMetricsManager(mockMetricsStorage, mockAmpli)
    const mockSendPayload = {asset_count: 10, nfts: [], tokens: []}

    metricsManager.track.nftGalleryDetailsTab({nft_tab: 'Metadata'})
    metricsManager.track.nftGalleryPageViewed({nft_count: 10})
    metricsManager.track.nftGallerySearchActivated({nft_search_term: 'test', nft_count: 10})
    metricsManager.track.nftGalleryDetailsPageViewed()
    metricsManager.track.nftGalleryDetailsImageViewed()

    metricsManager.track.sendInitiated()
    metricsManager.track.sendSelectAssetPageViewed()
    metricsManager.track.sendSelectAssetSelected(mockSendPayload)
    metricsManager.track.sendSelectAssetUpdated(mockSendPayload)
    metricsManager.track.sendSummaryPageViewed(mockSendPayload)
    metricsManager.track.sendSummarySubmitted(mockSendPayload)

    metricsManager.track.swapInitiated({
      from_asset: [{asset_name: 'ADA', asset_ticker: 'ADA', policy_id: '12345'}],
      to_asset: [{asset_name: 'DOGE', asset_ticker: 'DOGE', policy_id: '65432'}],
      order_type: 'limit',
      slippage_tolerance: 1,
    })
    metricsManager.track.swapSlippageChanged({
      slippage_tolerance: 1,
    })
    metricsManager.track.swapPoolChanged()
    metricsManager.track.swapOrderSelected({
      from_asset: [{asset_name: 'ADA', asset_ticker: 'ADA', policy_id: '12345'}],
      to_asset: [{asset_name: 'DOGE', asset_ticker: 'DOGE', policy_id: '65432'}],
      order_type: 'limit',
      slippage_tolerance: 1,
      from_amount: '12',
      to_amount: '31',
      pool_source: 'fake-pool',
      swap_fees: 1,
    })
    metricsManager.track.swapAssetFromChanged({
      from_asset: [{asset_name: 'ADA', asset_ticker: 'ADA', policy_id: '12345'}],
    })
    metricsManager.track.swapAssetToChanged({
      to_asset: [{asset_name: 'DOGE', asset_ticker: 'DOGE', policy_id: '65432'}],
    })

    metricsManager.track.walletPageExchangeClicked()
    metricsManager.track.walletPageBuyBannerClicked()

    metricsManager.track.exchangePageViewed()
    metricsManager.track.exchangeSubmitted({ramp_type: 'Buy', ada_amount: 222})

    metricsManager.track.governanceChooseDrepPageViewed()
    metricsManager.track.governanceConfirmTransactionPageViewed({governance_selection: 'Delegate'})
    metricsManager.track.governanceConfirmTransactionPageViewed({governance_selection: 'Abstain'})
    metricsManager.track.governanceConfirmTransactionPageViewed({governance_selection: 'No Confidence'})
    metricsManager.track.governanceDashboardPageViewed()
    metricsManager.track.governanceTransactionSuccessPageViewed({governance_selection: 'Delegate'})
    metricsManager.track.governanceTransactionSuccessPageViewed({governance_selection: 'Abstain'})
    metricsManager.track.governanceTransactionSuccessPageViewed({governance_selection: 'No Confidence'})

    metricsManager.track.createWalletDetailsSettled()
    metricsManager.track.createWalletDetailsStepViewed()
    metricsManager.track.createWalletDetailsSubmitted()
    metricsManager.track.createWalletLanguagePageViewed()
    metricsManager.track.createWalletLearnPhraseStepViewed()
    metricsManager.track.createWalletSavePhraseStepViewed()
    metricsManager.track.createWalletTermsPageViewed()
    metricsManager.track.createWalletSelectMethodPageViewed()
    metricsManager.track.createWalletVerifyPhraseStepViewed()
    metricsManager.track.createWalletVerifyPhraseWordSelected()

    metricsManager.track.restoreWalletDetailsSettled()
    metricsManager.track.restoreWalletDetailsStepViewed()
    metricsManager.track.restoreWalletEnterPhraseStepStatus({recovery_prhase_status: true})
    metricsManager.track.restoreWalletEnterPhraseStepStatus({recovery_prhase_status: false})
    metricsManager.track.restoreWalletEnterPhraseStepViewed({recovery_phrase_lenght: '15'})
    metricsManager.track.restoreWalletEnterPhraseStepViewed({recovery_phrase_lenght: '24'})
    metricsManager.track.restoreWalletTypeStepViewed()

    metricsManager.track.receiveAmountGeneratedPageViewed({ada_amount: 500})
    metricsManager.track.receiveAmountPageViewed()
    metricsManager.track.receiveCopyAddressClicked({copy_address_location: 'CTA Copy Address'})
    metricsManager.track.receiveCopyAddressClicked({copy_address_location: 'Long Press wallet Address'})
    metricsManager.track.receiveCopyAddressClicked({copy_address_location: 'Tap Address Details'})
    metricsManager.track.receiveGenerateNewAddressClicked()
    metricsManager.track.receivePageListViewed()
    metricsManager.track.receivePageViewed()
    metricsManager.track.receiveShareAddressClicked()

<<<<<<< HEAD
    metricsManager.track.discoverConnectedBottomSheetDisconnectClicked()
    metricsManager.track.discoverConnectedBottomSheetOpenDAppClicked()
    metricsManager.track.discoverConnectedDAppItemClicked()
    metricsManager.track.discoverDAppItemClicked()
    metricsManager.track.discoverFilterSelected({dapp_filter: 'Investment'})
    metricsManager.track.discoverFilterSelected({dapp_filter: 'Media'})
    metricsManager.track.discoverFilterSelected({dapp_filter: 'Trading'})
    metricsManager.track.discoverFilterSelected({dapp_filter: 'NFT'})
    metricsManager.track.discoverFilterSelected({dapp_filter: 'Community'})
    metricsManager.track.discoverPageViewed()
    metricsManager.track.discoverSearchActivated({search_term: 'random'})
    metricsManager.track.discoverWebViewBottomSheetConnectClicked()
    metricsManager.track.discoverWebViewCloseClicked()
    metricsManager.track.discoverWebViewTabBarBackwardClicked()
    metricsManager.track.discoverWebViewTabBarForwardClicked()
    metricsManager.track.discoverWebViewTabBarRefreshClicked()
    metricsManager.track.discoverWebViewTabBarShareClicked()
    metricsManager.track.discoverWebViewTabClicked()
    metricsManager.track.discoverWebViewToolbarSearchActivated({search_term: 'random'})
    metricsManager.track.discoverWebViewViewed()
=======
    metricsManager.track.portfolioDashboardPageViewed()
    metricsManager.track.portfolioTokenDetails({token_details_tab: 'Performance'})
    metricsManager.track.portfolioTokenDetails({token_details_tab: 'Transactions'})
    metricsManager.track.portfolioTokenDetails({token_details_tab: 'Overview'})
    metricsManager.track.portfolioTokensListPageViewed({tokens_tab: 'Wallet Token'})
    metricsManager.track.portfolioTokensListPageViewed({tokens_tab: 'Dapps Token'})
    metricsManager.track.portfolioTokensListSearchActivated({search_term: 'token'})
>>>>>>> origin/develop

    expect(mockAmpli.nftGalleryDetailsTab).toHaveBeenCalledWith({nft_tab: 'Metadata'})
    expect(mockAmpli.nftGalleryPageViewed).toHaveBeenCalledWith({nft_count: 10})
    expect(mockAmpli.nftGallerySearchActivated).toHaveBeenCalledWith({nft_search_term: 'test', nft_count: 10})
    expect(mockAmpli.nftGalleryDetailsPageViewed).toHaveBeenCalled()
    expect(mockAmpli.nftGalleryDetailsImageViewed).toHaveBeenCalled()

    expect(mockAmpli.sendInitiated).toHaveBeenCalled()
    expect(mockAmpli.sendSelectAssetPageViewed).toHaveBeenCalled()
    expect(mockAmpli.sendSelectAssetSelected).toHaveBeenCalledWith(mockSendPayload)
    expect(mockAmpli.sendSelectAssetUpdated).toHaveBeenCalledWith(mockSendPayload)
    expect(mockAmpli.sendSummaryPageViewed).toHaveBeenCalledWith(mockSendPayload)
    expect(mockAmpli.sendSummarySubmitted).toHaveBeenCalledWith(mockSendPayload)

    expect(mockAmpli.swapInitiated).toHaveBeenCalledWith({
      from_asset: [{asset_name: 'ADA', asset_ticker: 'ADA', policy_id: '12345'}],
      to_asset: [{asset_name: 'DOGE', asset_ticker: 'DOGE', policy_id: '65432'}],
      order_type: 'limit',
      slippage_tolerance: 1,
    })
    expect(mockAmpli.swapSlippageChanged).toHaveBeenCalledWith({
      slippage_tolerance: 1,
    })
    expect(mockAmpli.swapPoolChanged).toHaveBeenCalled()
    expect(mockAmpli.swapOrderSelected).toHaveBeenCalledWith({
      from_asset: [{asset_name: 'ADA', asset_ticker: 'ADA', policy_id: '12345'}],
      to_asset: [{asset_name: 'DOGE', asset_ticker: 'DOGE', policy_id: '65432'}],
      order_type: 'limit',
      slippage_tolerance: 1,
      from_amount: '12',
      to_amount: '31',
      pool_source: 'fake-pool',
      swap_fees: 1,
    })
    expect(mockAmpli.swapAssetFromChanged).toHaveBeenCalledWith({
      from_asset: [{asset_name: 'ADA', asset_ticker: 'ADA', policy_id: '12345'}],
    })
    expect(mockAmpli.swapAssetToChanged).toHaveBeenCalledWith({
      to_asset: [{asset_name: 'DOGE', asset_ticker: 'DOGE', policy_id: '65432'}],
    })

    expect(mockAmpli.walletPageExchangeClicked).toHaveBeenCalled()
    expect(mockAmpli.walletPageBuyBannerClicked).toHaveBeenCalled()

    expect(mockAmpli.exchangePageViewed).toHaveBeenCalled()
    expect(mockAmpli.exchangeSubmitted).toHaveBeenCalledWith({ramp_type: 'Buy', ada_amount: 222})

    expect(mockAmpli.governanceChooseDrepPageViewed).toHaveBeenCalled()
    expect(mockAmpli.governanceConfirmTransactionPageViewed).toHaveBeenCalledWith({governance_selection: 'Delegate'})
    expect(mockAmpli.governanceConfirmTransactionPageViewed).toHaveBeenCalledWith({governance_selection: 'Abstain'})
    expect(mockAmpli.governanceConfirmTransactionPageViewed).toHaveBeenCalledWith({
      governance_selection: 'No Confidence',
    })
    expect(mockAmpli.governanceDashboardPageViewed).toHaveBeenCalled()
    expect(mockAmpli.governanceTransactionSuccessPageViewed).toHaveBeenCalledWith({governance_selection: 'Delegate'})
    expect(mockAmpli.governanceTransactionSuccessPageViewed).toHaveBeenCalledWith({governance_selection: 'Abstain'})
    expect(mockAmpli.governanceTransactionSuccessPageViewed).toHaveBeenCalledWith({
      governance_selection: 'No Confidence',
    })

    expect(mockAmpli.createWalletDetailsSettled).toHaveBeenCalled()
    expect(mockAmpli.createWalletDetailsStepViewed).toHaveBeenCalled()
    expect(mockAmpli.createWalletDetailsSubmitted).toHaveBeenCalled()
    expect(mockAmpli.createWalletLanguagePageViewed).toHaveBeenCalled()
    expect(mockAmpli.createWalletLearnPhraseStepViewed).toHaveBeenCalled()
    expect(mockAmpli.createWalletSavePhraseStepViewed).toHaveBeenCalled()
    expect(mockAmpli.createWalletSelectMethodPageViewed).toHaveBeenCalled()
    expect(mockAmpli.createWalletTermsPageViewed).toHaveBeenCalled()
    expect(mockAmpli.createWalletVerifyPhraseStepViewed).toHaveBeenCalled()
    expect(mockAmpli.createWalletVerifyPhraseWordSelected).toHaveBeenCalled()

    expect(mockAmpli.restoreWalletDetailsSettled).toHaveBeenCalled()
    expect(mockAmpli.restoreWalletDetailsStepViewed).toHaveBeenCalled()
    expect(mockAmpli.restoreWalletEnterPhraseStepStatus).toHaveBeenCalledWith({recovery_prhase_status: true})
    expect(mockAmpli.restoreWalletEnterPhraseStepStatus).toHaveBeenCalledWith({recovery_prhase_status: false})
    expect(mockAmpli.restoreWalletEnterPhraseStepViewed).toHaveBeenCalledWith({recovery_phrase_lenght: '15'})
    expect(mockAmpli.restoreWalletEnterPhraseStepViewed).toHaveBeenCalledWith({recovery_phrase_lenght: '24'})
    expect(mockAmpli.restoreWalletTypeStepViewed).toHaveBeenCalled()

    expect(mockAmpli.receiveAmountGeneratedPageViewed).toHaveBeenCalledWith({ada_amount: 500})
    expect(mockAmpli.receiveAmountPageViewed).toHaveBeenCalled()
    expect(mockAmpli.receiveCopyAddressClicked).toHaveBeenCalledWith({copy_address_location: 'CTA Copy Address'})
    expect(mockAmpli.receiveCopyAddressClicked).toHaveBeenCalledWith({
      copy_address_location: 'Long Press wallet Address',
    })
    expect(mockAmpli.receiveCopyAddressClicked).toHaveBeenCalledWith({copy_address_location: 'Tap Address Details'})
    expect(mockAmpli.receiveGenerateNewAddressClicked).toHaveBeenCalled()
    expect(mockAmpli.receivePageListViewed).toHaveBeenCalled()
    expect(mockAmpli.receivePageViewed).toHaveBeenCalled()
    expect(mockAmpli.receiveShareAddressClicked).toHaveBeenCalled()

<<<<<<< HEAD
    expect(mockAmpli.discoverConnectedBottomSheetDisconnectClicked).toHaveBeenCalled() //
    expect(mockAmpli.discoverConnectedBottomSheetOpenDAppClicked).toHaveBeenCalled() //
    expect(mockAmpli.discoverConnectedDAppItemClicked).toHaveBeenCalled() //
    expect(mockAmpli.discoverDAppItemClicked).toHaveBeenCalled() //
    expect(mockAmpli.discoverFilterSelected).toHaveBeenCalledWith({dapp_filter: 'Investment'}) //
    expect(mockAmpli.discoverFilterSelected).toHaveBeenCalledWith({dapp_filter: 'Media'}) //
    expect(mockAmpli.discoverFilterSelected).toHaveBeenCalledWith({dapp_filter: 'Trading'}) //
    expect(mockAmpli.discoverFilterSelected).toHaveBeenCalledWith({dapp_filter: 'NFT'}) //
    expect(mockAmpli.discoverFilterSelected).toHaveBeenCalledWith({dapp_filter: 'Community'}) //
    expect(mockAmpli.discoverPageViewed).toHaveBeenCalled()
    expect(mockAmpli.discoverSearchActivated).toHaveBeenCalledWith({search_term: 'random'})
    expect(mockAmpli.discoverWebViewBottomSheetConnectClicked).toHaveBeenCalled()
    expect(mockAmpli.discoverWebViewCloseClicked).toHaveBeenCalled()
    expect(mockAmpli.discoverWebViewTabBarBackwardClicked).toHaveBeenCalled()
    expect(mockAmpli.discoverWebViewTabBarForwardClicked).toHaveBeenCalled()
    expect(mockAmpli.discoverWebViewTabBarRefreshClicked).toHaveBeenCalled()
    expect(mockAmpli.discoverWebViewTabBarShareClicked).toHaveBeenCalled()
    expect(mockAmpli.discoverWebViewTabClicked).toHaveBeenCalled()
    expect(mockAmpli.discoverWebViewToolbarSearchActivated).toHaveBeenCalledWith({search_term: 'random'})
    expect(mockAmpli.discoverWebViewViewed).toHaveBeenCalled()
=======
    expect(mockAmpli.portfolioDashboardPageViewed).toHaveBeenCalled()
    expect(mockAmpli.portfolioTokenDetails).toHaveBeenCalledWith({token_details_tab: 'Performance'})
    expect(mockAmpli.portfolioTokenDetails).toHaveBeenCalledWith({token_details_tab: 'Transactions'})
    expect(mockAmpli.portfolioTokenDetails).toHaveBeenCalledWith({token_details_tab: 'Overview'})
    expect(mockAmpli.portfolioTokensListPageViewed).toHaveBeenCalledWith({tokens_tab: 'Wallet Token'})
    expect(mockAmpli.portfolioTokensListPageViewed).toHaveBeenCalledWith({tokens_tab: 'Dapps Token'})
    expect(mockAmpli.portfolioTokensListSearchActivated).toHaveBeenCalledWith({search_term: 'token'})
>>>>>>> origin/develop
  })

  test('enable should set metrics enabled to true', async () => {
    const metricsManager = makeMetricsManager(mockMetricsStorage, mockAmpli)
    await metricsManager.enable()
    expect(await metricsManager.enabled()).toBe(true)
    expect(mockMetricsStorage.enabled.write).toHaveBeenCalledWith(true)
    expect(mockAmpli.client.setOptOut).toHaveBeenCalledWith(false)
  })

  test('disable should set metrics enabled to false', async () => {
    const mockMetricsStorageDisabled = {
      enabled: {
        read: jest.fn().mockResolvedValue(false),
        write: jest.fn().mockResolvedValue(undefined),
      },
      consentRequested: {
        read: jest.fn().mockResolvedValue(false),
        write: jest.fn().mockResolvedValue(undefined),
      },
    }
    const metricsManager = makeMetricsManager(mockMetricsStorageDisabled, mockAmpli)
    await metricsManager.disable()
    expect(await metricsManager.enabled()).toBe(false)
    expect(mockMetricsStorageDisabled.enabled.write).toHaveBeenCalledWith(false)
    expect(mockAmpli.client.setOptOut).toHaveBeenCalledWith(true)
    expect(mockAmpli.flush).toHaveBeenCalled()
  })
})
