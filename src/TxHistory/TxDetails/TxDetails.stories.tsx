import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks, QueryProvider, RouteProvider} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {TxDetails} from './TxDetails'

storiesOf('TxDetails', module).add('Default', () => (
  <QueryProvider>
    <RouteProvider params={{id: mocks.txid}}>
      <SelectedWalletProvider
        wallet={{
          ...mocks.wallet,
        }}
      >
        <TxDetails />
      </SelectedWalletProvider>
    </RouteProvider>
  </QueryProvider>
))
