import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SearchProvider} from '../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks} from '../../../../yoroi-wallets/mocks/wallet'
import {SwapProvider} from '../../common/SwapContext'
import {SelectTokenFromListScreen} from './SelectTokenFromListScreen'

storiesOf('Swap Select Token From List', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider>
          <SelectTokenFromListScreen />
        </SwapProvider>
      </SearchProvider>
    </SelectedWalletProvider>
  )
})
