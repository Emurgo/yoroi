import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {AssetList} from './AssetList'

storiesOf('AssetList', module)
  .add('baseStyle', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <WalletManagerProviderMock wallet={mocks.wallet}>
          <AssetList assets={mocks.tokenEntries} onSelect={action('onSelect')} />
        </WalletManagerProviderMock>
      </QueryClientProvider>
    )
  })
  .add('sendStyle', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <WalletManagerProviderMock wallet={mocks.wallet}>
          <AssetList assets={mocks.tokenEntries} onSelect={action('onSelect')} />
        </WalletManagerProviderMock>
      </QueryClientProvider>
    )
  })
  .add('loading', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <WalletManagerProviderMock wallet={{...mocks.wallet, fetchTokenInfo: () => new Promise(() => undefined)}}>
          <AssetList assets={mocks.tokenEntries} onSelect={action('onSelect')} />
        </WalletManagerProviderMock>
      </QueryClientProvider>
    )
  })
