import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../../../WalletManager/context/SelectedWalletContext'
import {SwapFormProvider} from '../../../../common/SwapFormProvider'
import {EditPrice} from './EditPrice'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('Swap Edit Limit Price', module)
  .addDecorator((story) => (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SwapFormProvider>
        <View style={styles.container}>{story()}</View>
      </SwapFormProvider>
    </SelectedWalletProvider>
  ))
  .add('Default', () => <EditPrice />)
