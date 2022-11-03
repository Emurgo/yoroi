import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {mockWallet, QueryProvider} from '../../../storybook'
import {Boundary} from '../../components'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {YoroiWallet} from '../../yoroi-wallets'
import {SendProvider} from '../Context/SendContext'
import {SendScreen} from './SendScreen'

storiesOf('SendScreen', module)
  .add('Default', () => <SendScreenTest />)
  .add('SendAll', () => <SendScreenTest isSendAll />)

const SendScreenTest = ({isSendAll}: {isSendAll?: boolean}) => {
  const wallet: YoroiWallet = {
    ...mockWallet,
    subscribe: () => action('subscribe'),
  }

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
