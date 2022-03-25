import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../src/SelectedWallet'
import {mockWallet} from '../../storybook'
import {VotingBanner} from './VotingBanner'

storiesOf('Voting Banner', module)
  .add('default', () => (
    <SelectedWalletProvider wallet={mockWallet}>
      <VotingBanner onPress={action('onPress')} disabled={false} />
    </SelectedWalletProvider>
  ))
  .add('disabled', () => (
    <SelectedWalletProvider wallet={mockWallet}>
      <VotingBanner onPress={action('onPress')} disabled />
    </SelectedWalletProvider>
  ))
