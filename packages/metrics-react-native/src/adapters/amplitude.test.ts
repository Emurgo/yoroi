import * as Amplitude from '@amplitude/analytics-react-native'
import {Metrics} from '@yoroi/types'

import {makeAmplitudeMetrics} from './amplitude'

jest.mock('@amplitude/analytics-react-native')

const mockedAmplitude = Amplitude as jest.Mocked<typeof Amplitude>

describe('makeAmplitudeMetrics', () => {
  const apiKey = 'test-api-key'
  const deviceId = 'test-device-id'
  const userId = 'test-user-id'
  const sessionId = 123456

  let amplitudeMetrics: Metrics.Module<any>
  let trackProperties: Metrics.Track<any>

  beforeEach(() => {
    mockedAmplitude.init.mockClear()
    mockedAmplitude.track.mockClear()
    mockedAmplitude.setOptOut.mockClear()
    mockedAmplitude.setUserId.mockClear()
    mockedAmplitude.setDeviceId.mockClear()
    mockedAmplitude.setSessionId.mockClear()

    amplitudeMetrics = makeAmplitudeMetrics({apiKey})

    trackProperties = {
      event: 'nft_click_navigate',
      properties: {test: 'test-metadata'},
    }
  })

  it('should initialize Amplitude', () => {
    expect(mockedAmplitude.init).toHaveBeenCalledWith(
      apiKey,
      undefined,
      undefined,
    )
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

  it('should set the device ID', () => {
    amplitudeMetrics.setDeviceId(deviceId)
    expect(mockedAmplitude.setDeviceId).toHaveBeenCalledWith(deviceId)
  })

  it('should set the user ID', () => {
    amplitudeMetrics.setUserId(userId)
    expect(mockedAmplitude.setUserId).toHaveBeenCalledWith(userId)
  })

  it('should set the session ID', () => {
    amplitudeMetrics.setSessionId(sessionId)
    expect(mockedAmplitude.setSessionId).toHaveBeenCalledWith(sessionId)
  })
})
