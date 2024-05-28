import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {mocks} from '../../../../../../yoroi-wallets/mocks/wallet'
import {SearchProvider} from '../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../WalletManager/context/SelectedWalletContext'
import {SwapFormProvider} from '../../../../common/SwapFormProvider'
import {ShowPoolActions} from './ShowPoolActions'

storiesOf('Swap Pool Actions', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider swapManager={mockSwapManager}>
          <SwapFormProvider>
            <ShowPoolActions />
          </SwapFormProvider>
        </SwapProvider>
      </SearchProvider>
    </SelectedWalletProvider>
  )
})
