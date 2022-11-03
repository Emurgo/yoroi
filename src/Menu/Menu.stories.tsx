import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mockWallet} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {Menu} from './Menu'

storiesOf('Menu', module).add('Menu, insufficient funds', () => (
  <QueryClientProvider client={new QueryClient()}>
    <SelectedWalletProvider wallet={mockWallet}>
      <Menu />
    </SelectedWalletProvider>
  </QueryClientProvider>
))
