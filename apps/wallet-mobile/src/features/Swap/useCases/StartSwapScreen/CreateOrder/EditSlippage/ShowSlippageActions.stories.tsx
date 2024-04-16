import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SearchProvider} from '../../../../../../Search/SearchContext'
import {mocks} from '../../../../../../yoroi-wallets/mocks/wallet'
import {SelectedWalletProvider} from '../../../../../WalletManager/Context/SelectedWalletContext'
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
