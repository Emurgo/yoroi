import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SearchProvider} from '../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks} from '../../../../yoroi-wallets/mocks/wallet'
import {SwapProvider} from '../../common/SwapContext'
import {SelectTokenToListScreen} from './SelectTokenToListScreen'

storiesOf('Swap Select Token To List', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider>
          <SelectTokenToListScreen />
        </SwapProvider>
      </SearchProvider>
    </SelectedWalletProvider>
  )
})
