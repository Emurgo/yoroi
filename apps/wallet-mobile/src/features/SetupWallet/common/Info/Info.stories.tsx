import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Info} from './Info'

storiesOf('AddWallet Info Symbol', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with icon', () => <Info paddingTop={3} onPress={() => action('info pressed')} />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'yellow',
  },
})
