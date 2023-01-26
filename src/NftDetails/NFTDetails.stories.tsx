import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks, QueryProvider, RouteProvider} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {NftDetails} from './NftDetails'

storiesOf('NFT/Details', module).add('Default', () => {
  const loadedWallet = {
    ...mocks.wallet,
    fetchNfts: mocks.fetchNfts.success.many,
    fetchNftModerationStatus: mocks.fetchNftModerationStatus.success.approved,
  }
  return (
    <RouteProvider params={{id: '1'}}>
      <QueryProvider>
        <SelectedWalletProvider wallet={loadedWallet}>
          <NftDetails />
        </SelectedWalletProvider>
      </QueryProvider>
    </RouteProvider>
  )
})
