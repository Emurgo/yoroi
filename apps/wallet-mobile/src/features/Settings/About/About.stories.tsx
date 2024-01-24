import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../SelectedWallet'
import {mocks} from '../../../yoroi-wallets/mocks'
import {About} from './About'

storiesOf('About', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <About />
  </SelectedWalletProvider>
))
