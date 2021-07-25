// @flow

import React from 'react'
import {StyleSheet, View} from 'react-native'

import {storiesOf} from '@storybook/react-native'

import Link from './Link'
import {text} from '@storybook/addon-knobs'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('Link', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('Default', () => <Link url={text('url', 'https://www.cardano.org')} text={text('label', 'Cardano')} />)
