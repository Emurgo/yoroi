import {storiesOf} from '@storybook/react-native'
import {TransferProvider} from '@yoroi/transfer'
import React from 'react'

import {mocks} from '../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SearchProvider} from '../../../Search/SearchContext'
import {ListAmountsToSendScreen} from './ListAmountsToSendScreen'

storiesOf('List Amounts To Send', module).add('initial', () => {
  return (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <TransferProvider initialState={{}}>
        <SearchProvider>
          <ListAmountsToSendScreen />
        </SearchProvider>
      </TransferProvider>
    </WalletManagerProviderMock>
  )
})
