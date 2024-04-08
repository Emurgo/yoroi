import {storiesOf} from '@storybook/react-native'
import {exchangeDefaultState, ExchangeProvider, successManagerMock} from '@yoroi/exchange'
import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {mocks} from '../../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../../WalletManager/Context'
import {SelectBuyOrSell} from './SelectBuyOrSell'

const Wrapper = ({children}: ViewProps) => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <ExchangeProvider manager={successManagerMock} initialState={{...exchangeDefaultState, providerId: 'banxa'}}>
      <View style={styles.container}>{children}</View>
    </ExchangeProvider>
  </SelectedWalletProvider>
)

storiesOf('Exchange SelectBuyOrSell', module)
  .addDecorator((story) => <Wrapper>{story()}</Wrapper>)
  .add('initial', () => <SelectBuyOrSell />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
