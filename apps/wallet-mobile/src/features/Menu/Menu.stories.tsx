import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

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
  .add('voting, isHW', () => (
    <QueryClientProvider client={new QueryClient()}>
      <WalletManagerProviderMock wallet={mocks.readonlyWallet}>
        <Menu />
      </WalletManagerProviderMock>
    </QueryClientProvider>
  ))
