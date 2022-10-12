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
  .add('DownloadCatalyst, loading', () => (
    <QueryProvider>
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          getDelegationStatus: async (...args) => {
            action('getDelegationStatus')(...args)
            return new Promise(() => null)
          },
        }}
      >
        <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
          <DownloadCatalyst onNext={action('onNext')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))

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
        <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
          <DownloadCatalyst onNext={action('onNext')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('DownloadCatalyst, not staked ', () => (
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
        <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
          <DownloadCatalyst onNext={action('onNext')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('DisplayPin', () => <DisplayPin pin="1234" onNext={action('onNext')} />)

  .add('ConfirmPin', () => <ConfirmPin pin="1234" onNext={action('onNext')} />)

  .add('ConfirmVotingTx, loading', () => (
    <QueryProvider>
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          createVotingRegTx: (...args) => {
            action('createVotingRegTx')(...args)
            return new Promise(() => null) // never resolves
          },
        }}
      >
        <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
          <ConfirmVotingTx onNext={action('onNext')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('ConfirmVotingTx, error', () => (
    <QueryProvider>
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          createVotingRegTx: (...args) => {
            action('createVotingRegTx')(...args)
            return Promise.reject(new Error('createVotingRegTx: error message'))
          },
        }}
      >
        <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
          <ConfirmVotingTx onNext={action('onNext')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('ConfirmVotingTx, password', () => (
    <QueryProvider>
      <SelectedWalletProvider
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
        <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
          <ConfirmVotingTx onNext={action('onNext')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('ConfirmVotingTx, hw', () => (
    <QueryProvider>
      <SelectedWalletProvider
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
        <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
          <ConfirmVotingTx onNext={action('onNext')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('ConfirmVotingTx, os', () => (
    <QueryProvider>
      <SelectedWalletProvider
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
        <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
          <ConfirmVotingTx onNext={action('onNext')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('QrCode, loading', () => (
    <QueryProvider>
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          createVotingRegTx: (...args) => {
            action('createVotingRegTx')(...args)
            return new Promise(() => null) // never resolves
          },
        }}
      >
        <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
          <QrCode onNext={action('onNext')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))
  .add('QrCode, error', () => (
    <QueryProvider>
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          createVotingRegTx: (...args) => {
            action('createVotingRegTx')(...args)
            return Promise.reject(new Error('createVotingRegTx: error message'))
          },
        }}
      >
        <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
          <QrCode onNext={action('onNext')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))
  .add('QrCode', () => (
    <QueryProvider>
      <SelectedWalletProvider
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
        <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>
          <QrCode onNext={action('onNext')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('CatalystBackupCheckModal', () => (
    <QueryProvider>
      <WithModalProps>
        {(modalProps) => <VotingRegistrationBackupCheckModal {...modalProps} onConfirm={action('onConfirm')} />}
      </WithModalProps>
    </QueryProvider>
  ))
