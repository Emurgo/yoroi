import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../yoroi-wallets/mocks/wallet'
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
