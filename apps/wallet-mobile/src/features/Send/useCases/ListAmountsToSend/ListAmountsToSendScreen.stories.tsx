import {storiesOf} from '@storybook/react-native'
import {TransferProvider} from '@yoroi/transfer'
import React from 'react'

import {SearchProvider} from '../../../../Search/SearchContext'
import {mocks} from '../../../../yoroi-wallets/mocks/wallet'
import {SelectedWalletProvider} from '../../../WalletManager/context/SelectedWalletContext'
import {ListAmountsToSendScreen} from './ListAmountsToSendScreen'

storiesOf('List Amounts To Send', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <TransferProvider initialState={{}}>
        <SearchProvider>
          <ListAmountsToSendScreen />
        </SearchProvider>
      </TransferProvider>
    </SelectedWalletProvider>
  )
})
