import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text, View} from 'react-native'

import {MetricsProvider, useMetrics} from './metricsManager'
import {mockMetricsManager} from './mocks'

storiesOf('Metrics', module).add('playground', () => {
  return (
    <MetricsProvider metricsManager={mockMetricsManager()}>
      <Playground />
    </MetricsProvider>
  )
})

const Playground = () => {
  const metrics = useMetrics()

  return (
    <View style={{flex: 1}}>
      <Text style={{lineHeight: 24, fontWeight: '700', alignSelf: 'center'}}>Metrics State</Text>

      <Text onPress={metrics[metrics.isEnabled ? 'disable' : 'enable']}>{JSON.stringify(metrics, null, 2)}</Text>
    </View>
  )
}
