import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {ConfirmTxWithSpendingPasswordModal} from './ConfirmTxWithSpendingPasswordModal'

storiesOf('ConfirmTxWithSpendingPasswordModal', module)
  .addDecorator((story) => (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <View style={styles.container}>{story()}</View>
    </WalletManagerProviderMock>
  ))
  .add('Default', () => <ConfirmTxWithSpendingPasswordModal unsignedTx={mocks.yoroiUnsignedTx} />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
