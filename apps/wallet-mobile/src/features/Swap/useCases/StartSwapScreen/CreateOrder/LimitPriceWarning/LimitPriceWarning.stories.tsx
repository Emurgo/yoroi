import {storiesOf} from '@storybook/react-native'
import {SelectedWalletProvider} from '../../../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../../../yoroi-wallets/mocks'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import {SwapTouchedProvider} from '../TouchedContext'
import React from 'react'
import {LimitPriceWarning} from './LimitPriceWarning'

storiesOf('LimitPriceWarning', module).add('Initial', () => <Initial />)

const Initial = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <SwapTouchedProvider>
          <LimitPriceWarning open={true} onClose={() => {}} onSubmit={() => {}} />
        </SwapTouchedProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
