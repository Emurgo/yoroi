import {action} from '@storybook/addon-actions'
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
      onChange={(value) => {
        action('Amount with label change')(value)
      }}
      touched
    />
  ))
  .add('with error', () => (
    <AmountCard
      label="ADA amount"
      amount={{quantity: '1000000', tokenId: ''}}
      wallet={mocks.wallet}
      onChange={(value) => {
        action('Amount with error change')(value)
      }}
      value="3"
      error="Not Enough Balannce"
      touched
    />
  ))
