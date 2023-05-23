import * as Amplitude from '@amplitude/analytics-node'
import {Metrics} from '@yoroi/types'

import {makeAmplitudeMetrics} from './amplitude'

jest.mock('@amplitude/analytics-node')

const mockedAmplitude = Amplitude as jest.Mocked<typeof Amplitude>

describe('makeAmplitudeMetrics', () => {
  const apiKey = 'test-api-key'

  let amplitudeMetrics: Metrics.Module<any>
  let trackProperties: Metrics.Track<any>

  beforeEach(() => {
    mockedAmplitude.init.mockClear()
    mockedAmplitude.track.mockClear()
    mockedAmplitude.setOptOut.mockClear()

    amplitudeMetrics = makeAmplitudeMetrics({apiKey})

    trackProperties = {
      event: 'nft_click_navigate',
      properties: {test: 'test-metadata'},
    }
  })

  it('should initialize Amplitude', () => {
    expect(mockedAmplitude.init).toHaveBeenCalledWith(apiKey, undefined)
  })

  it('should track events', () => {
    amplitudeMetrics.track(trackProperties)
    expect(mockedAmplitude.track).toHaveBeenCalledWith(
      trackProperties.event,
      trackProperties.properties,
      undefined,
    )
  })

  it('should disable tracking', () => {
    amplitudeMetrics.disable()
    expect(mockedAmplitude.setOptOut).toHaveBeenCalledWith(true)
  })

  it('should enable tracking', () => {
    amplitudeMetrics.enable()
    expect(mockedAmplitude.setOptOut).toHaveBeenCalledWith(false)
  })
})
