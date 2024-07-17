import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {SelectPoolFromList} from './SelectPoolFromList'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
storiesOf('Swap List Pool', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('initial', () => (
    <SelectPoolFromList
      pools={[
        {
          tokenA: {quantity: 4500000n, tokenId: 'token.A'},
          tokenB: {quantity: 9000000n, tokenId: 'token.B'},
          ptPriceTokenA: '0',
          ptPriceTokenB: '0',
          fee: '0.3', // 0.3%
          provider: 'minswap',
          batcherFee: {quantity: 1n, tokenId: '.'},
          deposit: {quantity: 1n, tokenId: '.'},
          poolId: '0',
          lpToken: {
            quantity: 0n,
            tokenId: '0.',
          },
        },
        {
          tokenA: {quantity: 4500000n, tokenId: 'token.A'},
          tokenB: {quantity: 9000000n, tokenId: 'token.B'},
          ptPriceTokenA: '0',
          ptPriceTokenB: '0',
          fee: '0.3', // 0.3%
          provider: 'sundaeswap',
          batcherFee: {quantity: 122n, tokenId: '.'},
          deposit: {quantity: 432n, tokenId: '.'},
          poolId: '23455',
          lpToken: {
            quantity: 13524n,
            tokenId: '135.5',
          },
        },
      ]}
    />
  ))
