import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../WalletManager/context/SelectedWalletContext'
import {Menu} from './Menu'

storiesOf('Menu', module)
  .add('voting, insufficient funds', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mocks.wallet}>
        <Menu />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))
  .add('voting, isHW', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mocks.readonlyWallet}>
        <Menu />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))
