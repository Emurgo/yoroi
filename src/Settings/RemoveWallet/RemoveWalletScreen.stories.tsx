import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {RemoveWalletScreen} from './RemoveWalletScreen'

storiesOf('RemoveWalletScreen', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <RemoveWalletScreen />
  </SelectedWalletProvider>
))
