import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockHwWallet, mockOsWallet, mockWallet, mockYoroiTx, WithModalProps} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {CatalystBackupCheckModal} from './CatalystBackupCheckModal'
import {Step1} from './Step1'
import {Step2} from './Step2'
import {Step3} from './Step3'
import {Step4} from './Step4'
import {Step5} from './Step5'
import {Step6} from './Step6'

storiesOf('Catalyst', module)
  .add('Step 1', () => <Step1 setPin={action('setPin')} />)
  .add('Step 2', () => <Step2 pin="1234" />)
  .add('Step 3', () => <Step3 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />)
  .add('Step 4, password', () => (
    <SelectedWalletProvider wallet={mockWallet}>
      <Step4 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
    </SelectedWalletProvider>
  ))
  .add('Step 4, hw', () => (
    <SelectedWalletProvider wallet={mockHwWallet}>
      <Step4 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
    </SelectedWalletProvider>
  ))
  .add('Step 4, os', () => (
    <SelectedWalletProvider wallet={mockOsWallet}>
      <Step4 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
    </SelectedWalletProvider>
  ))
  .add('Step 5, password', () => (
    <SelectedWalletProvider wallet={mockWallet}>
      <Step5 yoroiUnsignedTx={mockYoroiTx} />
    </SelectedWalletProvider>
  ))
  .add('Step 5, hw', () => (
    <SelectedWalletProvider wallet={mockHwWallet}>
      <Step5 yoroiUnsignedTx={mockYoroiTx} />
    </SelectedWalletProvider>
  ))
  .add('Step 5, os', () => (
    <SelectedWalletProvider wallet={mockOsWallet}>
      <Step5 yoroiUnsignedTx={mockYoroiTx} />
    </SelectedWalletProvider>
  ))
  .add('Step 6', () => <Step6 catalystSKHexEncrypted="catalystSKHexEncrypted" />)
  .add('CatalystBackupCheckModal', () => (
    <WithModalProps>
      {(modalProps) => <CatalystBackupCheckModal {...modalProps} onConfirm={action('onConfirm')} />}
    </WithModalProps>
  ))
