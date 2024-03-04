import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Loading} from './Loading'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const LoadingWrapper = () => {
  return (
    <View style={styles.container}>
      <Text>Something to see</Text>

      <Loading />
    </View>
  )
}

storiesOf('Loading', module).add('Loading', () => <LoadingWrapper />)
