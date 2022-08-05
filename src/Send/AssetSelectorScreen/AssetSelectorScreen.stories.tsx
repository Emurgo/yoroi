import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {balance, mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {AssetSelectorScreen} from './AssetSelectorScreen'

storiesOf('AssetSelectorScreen', module).add('Default', () => {
  return (
    <SelectedWalletProvider wallet={mockWallet}>
      <AssetSelectorScreen balance={balance} onSelect={action('onSelect')} onSelectAll={action('onSelectAll')} />
    </SelectedWalletProvider>
  )
})
