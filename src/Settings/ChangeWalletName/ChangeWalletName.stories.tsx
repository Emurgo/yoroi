import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {ChangeWalletName} from './ChangeWalletName'

storiesOf('ChangeWalletName', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <ChangeWalletName />
  </SelectedWalletProvider>
))
