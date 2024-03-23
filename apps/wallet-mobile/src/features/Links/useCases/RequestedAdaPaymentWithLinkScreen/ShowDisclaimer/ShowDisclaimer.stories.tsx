import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {ShowDisclaimer} from './ShowDisclaimer'

storiesOf('Links ShowDisclaimer', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => (
    <ShowDisclaimer title="title">
      <></>
    </ShowDisclaimer>
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
