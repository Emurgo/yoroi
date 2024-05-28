import {storiesOf} from '@storybook/react-native'
import {exchangeDefaultState, ExchangeProvider, successManagerMock} from '@yoroi/exchange'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../../../../yoroi-wallets/mocks'
import {SearchProvider} from '../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../WalletManager/context/SelectedWalletContext'
import {EditAmount} from './EditAmount'

storiesOf('Exchange Edit Amount', module).add('initial - message', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <ExchangeProvider manager={successManagerMock} initialState={{...exchangeDefaultState, providerId: 'banxa'}}>
          <View style={styles.container}>
            <EditAmount />
          </View>
        </ExchangeProvider>
      </SearchProvider>
    </SelectedWalletProvider>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
