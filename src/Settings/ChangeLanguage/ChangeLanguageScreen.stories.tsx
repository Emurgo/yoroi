import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {ChangeLanguageScreen} from './ChangeLanguageScreen'

storiesOf('ChangeLanguageScreen', module).add('Default', () => (
  <SelectedWalletProvider wallet={mockWallet}>
    <ChangeLanguageScreen />
  </SelectedWalletProvider>
))
