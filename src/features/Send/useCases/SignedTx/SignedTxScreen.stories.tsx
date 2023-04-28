import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {RouteProvider} from '../../../../../.storybook'
import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks} from '../../../../yoroi-wallets/mocks'
import {SignedTxScreen} from './SignedTxScreen'

storiesOf('Signed Tx Screen', module).add('initial', () => {
  return (
    <RouteProvider params={{id: mockTransaction.id}}>
      <SelectedWalletProvider wallet={mocks.wallet}>
        <SignedTxScreen />
      </SelectedWalletProvider>
    </RouteProvider>
  )
})

const mockTransaction = Object.values(mocks.wallet.transactions)[0]
