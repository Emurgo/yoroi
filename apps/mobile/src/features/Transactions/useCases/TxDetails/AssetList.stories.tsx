import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import React from 'react'

import {mocks} from '../../../../wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../wallets/mocks/WalletManagerProviderMock'
import {AssetList} from './AssetList'

storiesOf('AssetList', module)
  .add('baseStyle', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <WalletManagerProviderMock wallet={mocks.wallet}>
          <AssetList
            assets={mocks.tokenEntries}
            onSelect={action('onSelect')}
          />
        </WalletManagerProviderMock>
      </QueryClientProvider>
    )
  })
  .add('sendStyle', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <WalletManagerProviderMock wallet={mocks.wallet}>
          <AssetList
            assets={mocks.tokenEntries}
            onSelect={action('onSelect')}
          />
        </WalletManagerProviderMock>
      </QueryClientProvider>
    )
  })
