// @flow

import {storiesOf} from '@storybook/react-native'
import React from 'react'

// $FlowExpectedError
import {SelectedWalletProvider} from '../../../src/SelectedWallet'
import ReceiveScreen from './ReceiveScreen'

const wallet = {
  walletImplementationId: 'haskell-shelley',
}

storiesOf('ReceiveScreen', module).add('default', () => (
  <SelectedWalletProvider wallet={wallet}>
    <ReceiveScreen />
  </SelectedWalletProvider>
))
