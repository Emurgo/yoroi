import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {About} from '.'

storiesOf('About', module).add('Default', () => (
  <SelectedWalletProvider wallet={mockWallet}>
    <About />
  </SelectedWalletProvider>
))
