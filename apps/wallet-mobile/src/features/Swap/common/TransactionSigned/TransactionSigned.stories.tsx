import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {TransactionSigned} from './TransactionSigned'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('SWAP TransactionSigned', module) //
  .add('success', () => {
    return (
      <View style={styles.container}>
        <TransactionSigned />
      </View>
    )
  })
