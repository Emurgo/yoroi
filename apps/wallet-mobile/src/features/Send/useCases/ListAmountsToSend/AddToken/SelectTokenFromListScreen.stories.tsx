import {storiesOf} from '@storybook/react-native'
import {TransferProvider} from '@yoroi/transfer'
import React from 'react'

import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SearchProvider} from '../../../../Search/SearchContext'
import {SelectTokenFromListScreen} from './SelectTokenFromListScreen'

storiesOf('Select Token From List', module).add('initial', () => {
  return (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <SearchProvider>
        <TransferProvider>
          <SelectTokenFromListScreen />
        </TransferProvider>
      </SearchProvider>
    </WalletManagerProviderMock>
  )
})
