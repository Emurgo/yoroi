import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {YoroiWallet} from '@yoroi-wallets'
import * as React from 'react'

import {mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
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
    <SelectedWalletProvider wallet={wallet}>
      <SendProvider wallet={wallet} initialState={{sendAll: isSendAll}}>
        <SendScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
}
