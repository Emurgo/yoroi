import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ModalProvider} from '../../../components'
import DescribeAction from './DescribeAction'

storiesOf('DescribeAction For rampOnOff', module).add('Default', () => (
  <ModalProvider>
    <View style={styles.container}>
      <DescribeAction />
    </View>
  </ModalProvider>
))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
