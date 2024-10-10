import {storiesOf} from '@storybook/react-native'
import {exchangeDefaultState, ExchangeProvider, successManagerMock} from '@yoroi/exchange'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SearchProvider} from '../../../../Search/SearchContext'
import {EditAmount} from './EditAmount'

storiesOf('Exchange Edit Amount', module).add('initial - message', () => {
  return (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <SearchProvider>
        <ExchangeProvider manager={successManagerMock} initialState={{...exchangeDefaultState, providerId: 'banxa'}}>
          <View style={styles.container}>
            <EditAmount />
          </View>
        </ExchangeProvider>
      </SearchProvider>
    </WalletManagerProviderMock>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
