import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../AddWallet/common/Context'
import {About} from './About'

storiesOf('About', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <About />
  </SelectedWalletProvider>
))
