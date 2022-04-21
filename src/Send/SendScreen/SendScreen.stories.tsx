import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {BigNumber} from 'bignumber.js'
import React from 'react'

import {mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import type {TokenEntry} from '../../types'
import {SendScreen} from './SendScreen'

storiesOf('SendScreen', module)
  .addDecorator((story) => <SelectedWalletProvider wallet={mockWallet}>{story()}</SelectedWalletProvider>)
  .add('Default', () => {
    const selectedAsset: TokenEntry = {
      networkId: 300,
      identifier: '',
      amount: new BigNumber(12344.00234523),
    }

    return (
      <SendScreen
        sendAll={false}
        onSendAll={action('onSendAll')}
        selectedTokenIdentifier={selectedAsset.identifier}
        amount=""
        setAmount={action('setAmount')}
        receiver=""
        setReceiver={action('setReceiver')}
      />
    )
  })
  .add('sendAll', () => {
    const selectedAsset: TokenEntry = {
      networkId: 300,
      identifier: '',
      amount: new BigNumber(12344.00234523),
    }

    return (
      <SendScreen
        sendAll={true}
        onSendAll={action('onSendAll')}
        selectedTokenIdentifier={selectedAsset.identifier}
        amount=""
        setAmount={action('setAmount')}
        receiver=""
        setReceiver={action('setReceiver')}
      />
    )
  })
