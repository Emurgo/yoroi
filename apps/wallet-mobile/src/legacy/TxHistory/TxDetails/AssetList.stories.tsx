import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import React from 'react'

import {mocks} from '../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {AssetList} from './AssetList'
import {useSendStyles} from './AssetListSend.style'
import {useBaseStyles} from './Base.style'

storiesOf('AssetList', module)
  .add('baseStyle', () => {
    const styles = useBaseStyles()
    return (
      <QueryClientProvider client={new QueryClient()}>
        <WalletManagerProviderMock wallet={mocks.wallet}>
          <AssetList assets={mocks.tokenEntries} styles={styles} onSelect={action('onSelect')} />
        </WalletManagerProviderMock>
      </QueryClientProvider>
    )
  })
  .add('sendStyle', () => {
    const styles = useSendStyles()
    return (
      <QueryClientProvider client={new QueryClient()}>
        <WalletManagerProviderMock wallet={mocks.wallet}>
          <AssetList assets={mocks.tokenEntries} styles={styles} onSelect={action('onSelect')} />
        </WalletManagerProviderMock>
      </QueryClientProvider>
    )
  })
  .add('loading', () => {
    const styles = useSendStyles()
    return (
      <QueryClientProvider client={new QueryClient()}>
        <WalletManagerProviderMock wallet={{...mocks.wallet, fetchTokenInfo: () => new Promise(() => undefined)}}>
          <AssetList assets={mocks.tokenEntries} styles={styles} onSelect={action('onSelect')} />
        </WalletManagerProviderMock>
      </QueryClientProvider>
    )
  })
