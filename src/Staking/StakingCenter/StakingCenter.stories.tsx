import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {SelectedWalletProvider} from '../../SelectedWallet'
import {WalletInterface} from '../../types'
import {StakingCenter} from './StakingCenter'

const wallet = {
  networkId: 1,
  walletImplementationId: 'haskell-shelley',
} as WalletInterface

storiesOf('StakingCenter', module).add('with 100 ADA to delegate', () => (
  <SelectedWalletProvider wallet={wallet}>
    <StakingCenter />
  </SelectedWalletProvider>
))
