import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ModalProvider} from '../../../../components'
import {DescribeAction} from '../DescribeAction/DescribeAction'

storiesOf('RampOnOff DescribeAction', module)
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
