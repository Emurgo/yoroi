import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {About} from '.'

storiesOf('About', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <About />
  </SelectedWalletProvider>
))
