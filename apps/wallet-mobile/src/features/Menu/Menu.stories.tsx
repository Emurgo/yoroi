import {storiesOf} from '@storybook/react-native'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import * as React from 'react'

import {mocks} from '../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {Menu} from './Menu'

storiesOf('Menu', module)
  .add('voting, insufficient funds', () => (
    <QueryClientProvider client={new QueryClient()}>
      <WalletManagerProviderMock wallet={mocks.wallet}>
        <Menu />
      </WalletManagerProviderMock>
    </QueryClientProvider>
  ))
  .add('voting, is readonly', () => (
    <QueryClientProvider client={new QueryClient()}>
      <WalletManagerProviderMock wallet={mocks.wallet} meta={{...mocks.walletMeta, isReadOnly: true}}>
        <Menu />
      </WalletManagerProviderMock>
    </QueryClientProvider>
  ))
