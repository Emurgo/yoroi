import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ModalProvider} from '../../../../components/Modal/ModalContext'
import {DescribeAction} from './DescribeAction'

storiesOf('Exchange DescribeAction', module)
  .addDecorator((story) => (
    <ModalProvider>
      <View style={styles.container}>{story()}</View>
    </ModalProvider>
  ))
  .add('initial', () => <DescribeAction />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
