import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../src/SelectedWallet'
import {WalletInterface} from '../types'
import {VotingBanner} from './VotingBanner'

const wallet = {
  walletImplementationId: 'haskell-shelley',
} as WalletInterface

storiesOf('Voting Banner', module)
  .add('default', () => (
    <SelectedWalletProvider wallet={wallet}>
      <VotingBanner onPress={action('onPress')} disabled={false} />
    </SelectedWalletProvider>
  ))
  .add('disabled', () => (
    <SelectedWalletProvider wallet={wallet}>
      <VotingBanner onPress={action('onPress')} disabled />
    </SelectedWalletProvider>
  ))
