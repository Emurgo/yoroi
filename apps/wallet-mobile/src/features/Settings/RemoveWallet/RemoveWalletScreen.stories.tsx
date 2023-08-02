import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../SelectedWallet'
import {mocks} from '../../../yoroi-wallets/mocks'
import {RemoveWalletScreen} from './RemoveWalletScreen'

storiesOf('RemoveWalletScreen', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <RemoveWalletScreen />
  </SelectedWalletProvider>
))
