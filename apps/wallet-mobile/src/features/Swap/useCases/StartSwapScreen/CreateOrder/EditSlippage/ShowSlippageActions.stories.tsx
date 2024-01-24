import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SearchProvider} from '../../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../../SelectedWallet'
import {mocks} from '../../../../../../yoroi-wallets/mocks/wallet'
import {SwapFormProvider} from '../../../../common/SwapFormProvider'
import {ShowSlippageActions} from './ShowSlippageActions'

storiesOf('Swap Slippage Actions', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider swapManager={mockSwapManager}>
          <SwapFormProvider>
            <ShowSlippageActions />
          </SwapFormProvider>
        </SwapProvider>
      </SearchProvider>
    </SelectedWalletProvider>
  )
})
