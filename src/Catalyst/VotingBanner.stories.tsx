import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../src/SelectedWallet'
import {mocks} from '../../storybook'
import {VotingBanner} from './VotingBanner'

storiesOf('Voting Banner', module)
  .add('default', () => (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <VotingBanner onPress={action('onPress')} disabled={false} />
    </SelectedWalletProvider>
  ))
  .add('disabled', () => (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <VotingBanner onPress={action('onPress')} disabled />
    </SelectedWalletProvider>
  ))
