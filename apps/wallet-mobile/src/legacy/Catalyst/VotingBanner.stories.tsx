import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {VotingBanner} from './VotingBanner'

storiesOf('Voting Banner', module)
  .add('default', () => (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <VotingBanner onPress={action('onPress')} disabled={false} />
    </WalletManagerProviderMock>
  ))
  .add('disabled', () => (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <VotingBanner onPress={action('onPress')} disabled />
    </WalletManagerProviderMock>
  ))
