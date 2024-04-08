import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../WalletManager/Context'
import {About} from './About'

storiesOf('About', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <About />
  </SelectedWalletProvider>
))
