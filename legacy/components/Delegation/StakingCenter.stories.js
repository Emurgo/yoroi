// @flow

import {storiesOf} from '@storybook/react-native'
import React from 'react'

// $FlowExpectedError
import {SelectedWalletProvider} from '../../../src/SelectedWallet'
import StakingCenter from './StakingCenter'

const wallet = {
  networkId: 1,
  walletImplementationId: 'haskell-shelley',
}

storiesOf('StakingCenter', module).add('with 100 ADA to delegate', () => (
  <SelectedWalletProvider wallet={wallet}>
    <StakingCenter />
  </SelectedWalletProvider>
))
