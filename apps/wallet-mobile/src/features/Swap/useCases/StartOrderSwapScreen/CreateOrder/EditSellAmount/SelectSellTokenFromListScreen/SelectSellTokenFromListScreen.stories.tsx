import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {mocks} from '../../../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SearchProvider} from '../../../../../../Search/SearchContext'
import {SwapFormProvider} from '../../../../../common/SwapFormProvider'
import {SelectSellTokenFromListScreen} from './SelectSellTokenFromListScreen'

storiesOf('Swap Select Token To Sell', module).add('initial', () => {
  return (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider swapManager={mockSwapManager}>
          <SwapFormProvider>
            <SelectSellTokenFromListScreen />
          </SwapFormProvider>
        </SwapProvider>
      </SearchProvider>
    </WalletManagerProviderMock>
  )
})
