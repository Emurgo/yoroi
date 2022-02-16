import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../../storybook/mockWallet'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {StakingCenter} from './StakingCenter'

storiesOf('StakingCenter', module).add('with 100 ADA to delegate', () => (
  <SelectedWalletProvider
    wallet={{
      ...mockWallet,
      networkId: 1,
    }}
  >
    <StakingCenter />
  </SelectedWalletProvider>
))
