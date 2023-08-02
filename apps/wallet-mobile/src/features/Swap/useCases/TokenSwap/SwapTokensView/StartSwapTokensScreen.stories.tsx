import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks'
import {mocks as swapMocks} from '../../../common/mocks'
import {SwapProvider} from '../../../common/SwapContext'
import {SwapTokensView} from './SwapTokensView'

storiesOf('Swap Tokens View', module) //
  .add('adding: initial state', () => {
    return <Adding />
  })

const Adding = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider initialState={swapMocks.editingAmount.adding}>
        <SwapTokensView />
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
