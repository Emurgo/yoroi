import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SearchProvider} from '../../../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../../../SelectedWallet'
import {mocks} from '../../../../../../../yoroi-wallets/mocks/wallet'
import {SwapTouchedProvider} from '../../TouchedContext'
import {SelectBuyTokenFromListScreen} from './SelectBuyTokenFromListScreen'

storiesOf('Swap Select Token To Buy', module)
  .add('initial', () => {
    return (
      <SelectedWalletProvider wallet={mocks.wallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <SwapTouchedProvider>
              <SelectBuyTokenFromListScreen />
            </SwapTouchedProvider>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
  .add('fetching', () => {
    const fetching = {
      ...mocks.wallet,
      fetchTokenInfo: async (tokenId: string) => {
        await new Promise((r) => setTimeout(r, 5000))
        return mocks.wallet.fetchTokenInfo(tokenId)
      },
    }
    return (
      <SelectedWalletProvider wallet={fetching}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <SwapTouchedProvider>
              <SelectBuyTokenFromListScreen />
            </SwapTouchedProvider>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
