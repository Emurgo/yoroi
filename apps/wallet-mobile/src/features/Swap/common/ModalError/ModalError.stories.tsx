import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ModalError} from './ModalError'

storiesOf('ModalError', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => <ModalError error={new Error('Example Error')} />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
