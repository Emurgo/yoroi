/* eslint-disable @typescript-eslint/require-await */
import {act, render} from '@testing-library/react-native'
import * as React from 'react'
import {Text, View} from 'react-native'

import {MetricsProvider, useMetrics} from './metricsManager'
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
