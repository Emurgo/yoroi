import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../../../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
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
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <SwapFormProvider>
        <View style={styles.container}>{story()}</View>
      </SwapFormProvider>
    </WalletManagerProviderMock>
  ))
  .add('Default', () => <EditPrice />)
