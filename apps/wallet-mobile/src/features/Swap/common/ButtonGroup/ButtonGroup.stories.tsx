import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet} from 'react-native'
import {View} from 'react-native'

import {ButtonGroup} from './index'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('Button Group', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with label', () => (
    <ButtonGroup
      buttons={['Button1', 'Button2']}
      onButtonPress={(event) => {
        console.log(event)
      }}
    />
  ))
