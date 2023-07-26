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

  nftGalleryDetailsTab: jest.fn(),
  nftGalleryPageViewed: jest.fn(),
  nftGallerySearchActivated: jest.fn(),
  nftGalleryDetailsPageViewed: jest.fn(),

  sendInitiated: jest.fn(),
  sendAmountUpdated: jest.fn(),
  sendAmountSelected: jest.fn(),
  sendAmountPageViewed: jest.fn(),
  sendConfirmedPageViewed: jest.fn(),
  sendAmountPreviewSettled: jest.fn(),
  sendAmountPreviewRequested: jest.fn(),
  sendAmountPreviewSubmitted: jest.fn(),
  sendAmountPreviewPageViewed: jest.fn(),

  swapInitiated: jest.fn(),
  swapPoolChanged: jest.fn(),
  swapOrderSelected: jest.fn(),
  swapAssetToChanged: jest.fn(),
  swapOrderSubmitted: jest.fn(),
  swapSlippageChanged: jest.fn(),
  swapAssetFromChanged: jest.fn(),
  swapConfirmedPageViewed: jest.fn(),
  swapCancelationSubmitted: jest.fn(),
} as unknown as Ampli

const mockMetricsStorage = {
  enabled: {
    read: jest.fn().mockResolvedValue(true),
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
        configuration: {optOut: false, flushIntervalMillis: expect.any(Number)},
      },
    })
  })

  test('track should call the appropriate metricsModule methods', () => {
    const metricsManager = makeMetricsManager(mockMetricsStorage, mockAmpli)

    metricsManager.track.nftGalleryDetailsTab({nft_tab: 'Metadata'})
    metricsManager.track.nftGalleryPageViewed({nft_count: 10})
    metricsManager.track.nftGallerySearchActivated({nft_search_term: 'test', nft_count: 10})
    metricsManager.track.nftGalleryDetailsPageViewed()

    expect(mockAmpli.nftGalleryDetailsTab).toHaveBeenCalledWith({nft_tab: 'Metadata'})
    expect(mockAmpli.nftGalleryPageViewed).toHaveBeenCalledWith({nft_count: 10})
    expect(mockAmpli.nftGallerySearchActivated).toHaveBeenCalledWith({nft_search_term: 'test', nft_count: 10})
    expect(mockAmpli.nftGalleryDetailsPageViewed).toHaveBeenCalled()
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
    }
    const metricsManager = makeMetricsManager(mockMetricsStorageDisabled, mockAmpli)
    await metricsManager.disable()
    expect(await metricsManager.enabled()).toBe(false)
    expect(mockAmpli.client.setOptOut).toHaveBeenCalledWith(true)
  })
})
