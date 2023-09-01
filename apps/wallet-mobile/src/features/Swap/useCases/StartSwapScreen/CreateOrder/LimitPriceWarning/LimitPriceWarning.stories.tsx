import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../../../yoroi-wallets/mocks'
import {SwapTouchedProvider} from '../TouchedContext'
import {LimitPriceWarning} from './LimitPriceWarning'

storiesOf('LimitPriceWarning', module).add('Initial', () => <Initial />)

const Initial = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <SwapTouchedProvider>
          <LimitPriceWarning open />
        </SwapTouchedProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
