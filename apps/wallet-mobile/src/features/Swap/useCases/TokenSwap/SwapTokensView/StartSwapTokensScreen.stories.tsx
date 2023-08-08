import {storiesOf} from '@storybook/react-native'
import {makeSwapApi, makeSwapManager, makeSwapStorage, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks'
import {mocks as swapMocks} from '../../../common/mocks'
import {SwapTokensView} from './SwapTokensView'

storiesOf('Swap Tokens View', module) //
  .add('adding: initial state', () => {
    return <Adding />
  })

const Adding = () => {
  const swapStorage = makeSwapStorage()
  const swapAPI = makeSwapApi({network: 0, stakingKey: '2222'})
  const swapManager = makeSwapManager(swapStorage, swapAPI)

  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={swapManager} initialState={swapMocks.editingAmount.adding}>
        <SwapTokensView />
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
