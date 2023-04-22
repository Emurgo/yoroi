import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {LoadingOverlay} from './LoadingOverlay'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const Loading = () => {
  return (
    <View style={styles.container}>
      <Text>Something to see</Text>

      <LoadingOverlay loading />
    </View>
  )
}

storiesOf('LoadingOverlay', module).add('Loading', () => <Loading />)
