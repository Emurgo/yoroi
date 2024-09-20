import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../yoroi-wallets/mocks/wallet'
import {ConfirmTxWithHwModal} from './ConfirmTxWithHwModal'

storiesOf('ConfirmTxWithHwModal', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('Default', () => <ConfirmTxWithHwModal unsignedTx={mocks.yoroiUnsignedTx} />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
