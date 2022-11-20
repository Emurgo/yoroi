import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text} from 'react-native'
import {StyleSheet, View} from 'react-native'

import {Hr} from './Hr'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
})

const Example = () => {
  return (
    <View style={styles.container}>
      <Text>Text</Text>
      <Hr />
      <Text>Text</Text>
      <Hr />
      <Text>Text</Text>
    </View>
  )
}

storiesOf('Hr', module).add('Example', () => <Example />)
