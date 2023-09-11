import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {SwapFormProvider} from '../../common/SwapFormProvider'
import {StartSwapScreen} from './StartSwapScreen'

storiesOf('Swap Start Screen', module) //
  .add('initial state', () => {
    return <Initial />
  })

const Initial = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <SwapFormProvider>
          <StartSwapScreen />
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
