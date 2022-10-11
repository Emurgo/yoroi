import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockHwWallet, mockOsWallet, mockWallet, mockYoroiTx, QueryProvider, WithModalProps} from '../../storybook'
import {Boundary} from '../components'
import {SelectedWalletProvider} from '../SelectedWallet'
import {ConfirmPin} from './ConfirmPin'
import {ConfirmVotingTx} from './ConfirmVotingTx'
import {DisplayPin} from './DisplayPin'
import {DownloadCatalyst} from './DownloadCatalyst'
import {QrCode} from './QrCode'
import {VotingRegistrationBackupCheckModal} from './VotingRegistrationBackupCheckModal'

storiesOf('Catalyst', module)
  .add('DownloadCatalyst, staked', () => (
    <QueryProvider>
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          getDelegationStatus: async (...args) => {
            action('getDelegationStatus', ...args)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return {
              isRegistered: true,
              poolKeyHash: 'poolKeyHash',
            }
          },
          fetchAccountState: async (...args) => {
            action('fetchAccountState')(...args)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return {
              'reward-address-hex': {
                remainingAmount: '0',
                rewards: '0',
                withdrawals: '',
              },
            }
          },
        }}
      >
        <Boundary>
          <DownloadCatalyst onNext={action('onNext')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('DownloadCatalyst, notStaked ', () => (
    <QueryProvider>
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          getDelegationStatus: async (...args) => {
            action('getDelegationStatus')(...args)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return {isRegistered: false}
          },
        }}
      >
        <Boundary>
          <DownloadCatalyst onNext={action('onNext')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('DisplayPin', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mockWallet}>
        <DisplayPin pin="1234" onNext={action('onNext')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('ConfirmPin', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mockWallet}>
        <ConfirmPin pin="1234" onNext={action('onNext')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('ConfirmVotingTx, password', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mockWallet}>
        <ConfirmVotingTx votingRegTx={mockYoroiTx} onNext={action('onNext')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('ConfirmVotingTx, hw', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mockHwWallet}>
        <ConfirmVotingTx votingRegTx={mockYoroiTx} onNext={action('onNext')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('ConfirmVotingTx, os', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mockOsWallet}>
        <ConfirmVotingTx votingRegTx={mockYoroiTx} onNext={action('onNext')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('QrCode', () => <QrCode catalystSKHexEncrypted="catalystSKHexEncrypted" onNext={action('onNext')} />)
  .add('CatalystBackupCheckModal', () => (
    <QueryProvider>
      <WithModalProps>
        {(modalProps) => <VotingRegistrationBackupCheckModal {...modalProps} onConfirm={action('onConfirm')} />}
      </WithModalProps>
    </QueryProvider>
  ))
