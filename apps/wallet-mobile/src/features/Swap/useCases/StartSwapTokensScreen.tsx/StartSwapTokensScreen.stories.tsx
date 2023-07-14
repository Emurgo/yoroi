import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../src/SelectedWallet'
import {mocks as walletMocks} from '../../../../../src/yoroi-wallets/mocks'
import {mocks as swapMocks} from '../../common/mocks'
import {SwapProvider} from '../../common/SwapContext'
import {StartSwapTokensScreen} from './StartSwapTokensScreen'

storiesOf('Swap Tokens', module) //
  .add('adding: empty initial', () => {
    return <Adding />
  })

const Adding = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider initialState={swapMocks.editingAmount.adding}>
        <StartSwapTokensScreen />
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
