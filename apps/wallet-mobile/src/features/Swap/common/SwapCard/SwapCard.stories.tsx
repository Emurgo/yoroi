import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../../../yoroi-wallets/mocks/wallet'
import {SwapCard} from './SwapCard'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('Swap Card', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with label', () => (
    <SwapCard
      label="Swap from"
      amount={{quantity: '2222', tokenId: ''}}
      wallet={mocks.wallet}
      onChange={function (value: string): void {
        console.log('VALUE', value)
      }}
    />
  ))
  .add('with error', () => (
    <SwapCard
      label="Swap from"
      amount={{quantity: '22222222', tokenId: ''}}
      wallet={mocks.wallet}
      onChange={function (value: string): void {
        console.log('VALUE', value)
      }}
      value="2223"
      hasError
    />
  ))
