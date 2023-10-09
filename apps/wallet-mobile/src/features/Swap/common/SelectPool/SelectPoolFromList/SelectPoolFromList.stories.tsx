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
          tokenA: {quantity: '4500000', tokenId: 'tokenA'},
          tokenB: {quantity: '9000000', tokenId: 'tokenB'},
          ptPriceTokenA: '0',
          ptPriceTokenB: '0',
          fee: '0.3', // 0.3%
          provider: 'minswap',
          batcherFee: {quantity: '1', tokenId: ''},
          deposit: {quantity: '1', tokenId: ''},
          poolId: '0',
          lpToken: {
            quantity: '0',
            tokenId: '0',
          },
        },
        {
          tokenA: {quantity: '4500000', tokenId: 'tokenA'},
          tokenB: {quantity: '9000000', tokenId: 'tokenB'},
          ptPriceTokenA: '0',
          ptPriceTokenB: '0',
          fee: '0.3', // 0.3%
          provider: 'sundaeswap',
          batcherFee: {quantity: '122', tokenId: ''},
          deposit: {quantity: '432', tokenId: ''},
          poolId: '23455',
          lpToken: {
            quantity: '13524',
            tokenId: '1355',
          },
        },
      ]}
    />
  ))
