import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text, View} from 'react-native'

import {ErrorBoundary} from './ErrorBoundary'

storiesOf('ErrorBoundary', module)
  .add('Default', () => {
    return (
      <ErrorBoundary>
        <View>
          <Text>This text is correct</Text>
        </View>
      </ErrorBoundary>
    )
  })
  .add('Error', () => {
    return (
      <ErrorBoundary>
        <Throws />
      </ErrorBoundary>
    )
  })

const Throws = () => {
  throw new Error('something went wrong')
}
