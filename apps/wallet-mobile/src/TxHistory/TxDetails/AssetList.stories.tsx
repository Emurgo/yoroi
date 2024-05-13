import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {SelectedWalletProvider} from '../../features/WalletManager/Context'
import {mocks} from '../../yoroi-wallets/mocks'
import {AssetList} from './AssetList'
import {useSendStyles} from './AssetListSend.style'
import {useBaseStyles} from './Base.style'

storiesOf('AssetList', module)
  .add('baseStyle', () => {
    const styles = useBaseStyles()
    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <AssetList assets={mocks.tokenEntries} styles={styles} onSelect={action('onSelect')} />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('sendStyle', () => {
    const styles = useSendStyles()
    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <AssetList assets={mocks.tokenEntries} styles={styles} onSelect={action('onSelect')} />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('loading', () => {
    const styles = useSendStyles()
    return (
      <QueryClientProvider client={new QueryClient()}>
        <SelectedWalletProvider wallet={{...mocks.wallet, fetchTokenInfo: () => new Promise(() => undefined)}}>
          <AssetList assets={mocks.tokenEntries} styles={styles} onSelect={action('onSelect')} />
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
