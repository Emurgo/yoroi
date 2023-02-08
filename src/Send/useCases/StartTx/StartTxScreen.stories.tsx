import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {QueryProvider} from '../../../../.storybook/decorators'
import {Boundary} from '../../../components'
import {SelectedWalletProvider} from '../../../SelectedWallet'
import {YoroiWallet} from '../../../yoroi-wallets'
import {mocks} from '../../../yoroi-wallets/mocks/wallet'
import {SendProvider} from '../../shared/SendContext'
import {StartTxScreen} from './StartTxScreen'

storiesOf('Send/StartTx', module)
  .add('Default', () => <SendScreenTest />)
  .add('SendAll', () => <SendScreenTest />)

const SendScreenTest = () => {
  const wallet: YoroiWallet = mocks.wallet

  return (
    <QueryProvider>
      <SelectedWalletProvider wallet={wallet}>
        <SendProvider initialState={{}}>
          <Boundary>
            <StartTxScreen />
          </Boundary>
        </SendProvider>
      </SelectedWalletProvider>
    </QueryProvider>
  )
}
