import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {SelectedWalletProvider} from '../../SelectedWallet'
import {mocks} from '../../yoroi-wallets/mocks'
import {AssetList} from './AssetList'
import sendStyle from './AssetListSend.style'
import baseStyle from './Base.style'

storiesOf('AssetList', module)
  .add('baseStyle', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mocks.wallet}>
        <AssetList assets={mocks.tokenEntries} styles={baseStyle} onSelect={action('onSelect')} />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))
  .add('sendStyle', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mocks.wallet}>
        <AssetList assets={mocks.tokenEntries} styles={sendStyle} onSelect={action('onSelect')} />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))
  .add('loading', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={{...mocks.wallet, fetchTokenInfo: () => new Promise(() => undefined)}}>
        <AssetList assets={mocks.tokenEntries} styles={sendStyle} onSelect={action('onSelect')} />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))
  .add('privacyMode enabled', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mocks.wallet}>
        <AssetList assets={mocks.tokenEntries} styles={sendStyle} onSelect={action('onSelect')} isPrivacyOff />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))
