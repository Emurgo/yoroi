import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {CardAboutPhrase} from './CardAboutPhrase'

storiesOf('AddWallet CardAboutPhrase', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with background color and spacing', () => (
    <CardAboutPhrase
      linesOfText={['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']}
      showBackgroundColor
      includeSpacing
    />
  ))
  .add('with title and without background color and spacing', () => (
    <CardAboutPhrase title="Title" linesOfText={['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']} />
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
