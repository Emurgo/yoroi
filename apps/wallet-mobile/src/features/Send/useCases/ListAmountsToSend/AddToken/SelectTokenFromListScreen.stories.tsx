import {storiesOf} from '@storybook/react-native'
import {TransferProvider} from '@yoroi/transfer'
import React from 'react'

import {SearchProvider} from '../../../../../Search/SearchContext'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {SelectedWalletProvider} from '../../../../WalletManager/context/SelectedWalletContext'
import {SelectTokenFromListScreen} from './SelectTokenFromListScreen'

storiesOf('Select Token From List', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <TransferProvider>
          <SelectTokenFromListScreen />
        </TransferProvider>
      </SearchProvider>
    </SelectedWalletProvider>
  )
})
