import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {COLORS} from '../../theme'
import {Card} from './Card'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  strong: {
    fontWeight: '500',
  },
  text: {
    fontSize: 18,
    lineHeight: 26,
    color: COLORS.WHITE,
  },
  details: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.WHITE,
    opacity: 0.5,
  },
  alignRight: {
    alignSelf: 'flex-end',
  },
})

const Example = () => {
  return (
    <View style={styles.container}>
      <Card style={{alignItems: 'stretch', flexDirection: 'row'}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.text}>Total</Text>
          <Text style={[styles.text, styles.strong]}>300 ADA</Text>
        </View>
        <Text style={[styles.details, styles.alignRight]}>2.4 USD</Text>
        <Text style={[styles.text, styles.alignRight]}>1 asset</Text>
      </Card>
    </View>
  )
}

storiesOf('Card', module).add('Example', () => <Example />)
