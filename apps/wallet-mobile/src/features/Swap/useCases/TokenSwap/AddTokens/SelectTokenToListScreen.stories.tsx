import {storiesOf} from '@storybook/react-native'
import {makeSwapApi, makeSwapManager, makeSwapStorage, SwapProvider} from '@yoroi/react-swap'
import React from 'react'

import {SearchProvider} from '../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {SelectTokenToListScreen} from './SelectTokenToListScreen'

storiesOf('Swap Select Token To List', module).add('initial', () => {
  const swapStorage = makeSwapStorage()
  const swapAPI = makeSwapApi({network: 0, stakingKey: '2222'})
  const swapManager = makeSwapManager(swapStorage, swapAPI)

  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider swapManager={swapManager}>
          <SelectTokenToListScreen />
        </SwapProvider>
      </SearchProvider>
    </SelectedWalletProvider>
  )
})
