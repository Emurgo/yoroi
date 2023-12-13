import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../../../yoroi-wallets/mocks/wallet'
import {AmountCard} from './AmountCard'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('Amount Card For rampOnOff', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('with label', () => (
    <AmountCard
      label="ADA amount"
      amount={{quantity: '1000000', tokenId: ''}}
      wallet={mocks.wallet}
      onChange={function (value: string): void {
        console.log('VALUE', value)
      }}
      touched
    />
  ))
  .add('with error', () => (
    <AmountCard
      label="ADA amount"
      amount={{quantity: '1000', tokenId: ''}}
      wallet={mocks.wallet}
      onChange={function (value: string): void {
        console.log('VALUE', value)
      }}
      value="11122"
      error="Not Enough Balannce"
      touched
    />
  ))
