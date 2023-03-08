import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {QueryProvider} from '../../../.storybook'
import {Boundary} from '../../components'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {YoroiWallet} from '../../yoroi-wallets'
import {mocks} from '../../yoroi-wallets/mocks'
import {SendProvider} from '../Context/SendContext'
import {SendScreen} from './SendScreen'

storiesOf('SendScreen', module)
  .add('Default', () => <SendScreenTest />)
  .add('SendAll', () => <SendScreenTest isSendAll />)

const SendScreenTest = ({isSendAll}: {isSendAll?: boolean}) => {
  const wallet: YoroiWallet = mocks.wallet

  return (
    <QueryProvider>
      <SelectedWalletProvider wallet={wallet}>
        <SendProvider wallet={wallet} initialState={{sendAll: isSendAll}}>
          <Boundary>
            <SendScreen />
          </Boundary>
        </SendProvider>
      </SelectedWalletProvider>
    </QueryProvider>
  )
}
