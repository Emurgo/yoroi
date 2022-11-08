import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockHwWallet, mockOsWallet, mockWallet, mockYoroiTx, QueryProvider, WithModalProps} from '../../storybook'
import {Boundary} from '../components'
import {SelectedWalletProvider} from '../SelectedWallet'
import {YoroiWallet} from '../yoroi-wallets'
import {ConfirmPin} from './ConfirmPin'
import {ConfirmVotingTx} from './ConfirmVotingTx'
import {DisplayPin} from './DisplayPin'
import {DownloadCatalyst} from './DownloadCatalyst'
import {QrCode} from './QrCode'
import {VotingRegistrationBackupCheckModal} from './VotingRegistrationBackupCheckModal'

storiesOf('Catalyst', module)
  .add('DownloadCatalyst, loading', () => (
    <Providers
      wallet={{
        ...mockWallet,
        getDelegationStatus: async (...args) => {
          action('getDelegationStatus')(...args)
          return new Promise(() => null)
        },
      }}
    >
      <DownloadCatalyst onNext={action('onNext')} />
    </Providers>
  ))

  .add('DownloadCatalyst, staked', () => (
    <Providers
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
      <DownloadCatalyst onNext={action('onNext')} />
    </Providers>
  ))

  .add('DownloadCatalyst, not staked ', () => (
    <Providers
      wallet={{
        ...mockWallet,
        getDelegationStatus: async (...args) => {
          action('getDelegationStatus')(...args)
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return {isRegistered: false}
        },
      }}
    >
      <DownloadCatalyst onNext={action('onNext')} />
    </Providers>
  ))

  .add('DisplayPin', () => <DisplayPin pin="1234" onNext={action('onNext')} />)

  .add('ConfirmPin', () => <ConfirmPin pin="1234" onNext={action('onNext')} />)

  .add('ConfirmVotingTx, loading', () => (
    <Providers
      wallet={{
        ...mockWallet,
        createVotingRegTx: (...args) => {
          action('createVotingRegTx')(...args)
          return new Promise(() => null) // never resolves
        },
      }}
    >
      <ConfirmVotingTx onNext={action('onNext')} />
    </Providers>
  ))

  .add('ConfirmVotingTx, error', () => (
    <Providers
      wallet={{
        ...mockWallet,
        createVotingRegTx: (...args) => {
          action('createVotingRegTx')(...args)
          return Promise.reject(new Error('createVotingRegTx: error message'))
        },
      }}
    >
      <ConfirmVotingTx onNext={action('onNext')} />
    </Providers>
  ))

  .add('ConfirmVotingTx, password', () => (
    <Providers
      wallet={{
        ...mockWallet,
        createVotingRegTx: async (...args) => {
          action('createVotingRegTx')(...args)
          return {
            votingRegTx: mockYoroiTx,
            votingKeyEncrypted: 'votingKeyEncrypted',
          }
        },
      }}
    >
      <ConfirmVotingTx onNext={action('onNext')} />
    </Providers>
  ))

  .add('ConfirmVotingTx, hw', () => (
    <Providers
      wallet={{
        ...mockHwWallet,
        createVotingRegTx: async (...args) => {
          action('createVotingRegTx')(...args)
          return {
            votingRegTx: mockYoroiTx,
            votingKeyEncrypted: 'votingKeyEncrypted',
          }
        },
      }}
    >
      <ConfirmVotingTx onNext={action('onNext')} />
    </Providers>
  ))

  .add('ConfirmVotingTx, os', () => (
    <Providers
      wallet={{
        ...mockOsWallet,
        createVotingRegTx: async (...args) => {
          action('createVotingRegTx')(...args)
          return {
            votingRegTx: mockYoroiTx,
            votingKeyEncrypted: 'votingKeyEncrypted',
          }
        },
      }}
    >
      <ConfirmVotingTx onNext={action('onNext')} />
    </Providers>
  ))

  .add('QrCode, loading', () => (
    <Providers
      wallet={{
        ...mockWallet,
        createVotingRegTx: (...args) => {
          action('createVotingRegTx')(...args)
          return new Promise(() => null) // never resolves
        },
      }}
    >
      <QrCode onNext={action('onNext')} />
    </Providers>
  ))
  .add('QrCode, error', () => (
    <Providers
      wallet={{
        ...mockWallet,
        createVotingRegTx: (...args) => {
          action('createVotingRegTx')(...args)
          return Promise.reject(new Error('createVotingRegTx: error message'))
        },
      }}
    >
      <QrCode onNext={action('onNext')} />
    </Providers>
  ))
  .add('QrCode', () => (
    <Providers
      wallet={{
        ...mockWallet,
        createVotingRegTx: async (...args) => {
          action('createVotingRegTx')(...args)
          return {
            votingRegTx: mockYoroiTx,
            votingKeyEncrypted: 'votingKeyEncrypted',
          }
        },
      }}
    >
      <QrCode onNext={action('onNext')} />
    </Providers>
  ))

  .add('CatalystBackupCheckModal', () => (
    <QueryProvider>
      <WithModalProps>
        {(modalProps) => <VotingRegistrationBackupCheckModal {...modalProps} onConfirm={action('onConfirm')} />}
      </WithModalProps>
    </QueryProvider>
  ))

const Providers = ({wallet, children}: {wallet: YoroiWallet; children: React.ReactNode}) => {
  return (
    <QueryProvider>
      <SelectedWalletProvider wallet={wallet}>
        <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>{children}</Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  )
}
