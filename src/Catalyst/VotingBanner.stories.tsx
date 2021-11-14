import {action, actions} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../SelectedWallet'
import {WalletInterface} from '../types'
import {VotingBanner} from './VotingBanner'

const wallet: WalletInterface = {
  implementationId: 'haskell-shelley',
  fetchFundInfo: actions('fetchFundInfo'),
} as any // eslint-disable-line @typescript-eslint/no-explicit-any

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
