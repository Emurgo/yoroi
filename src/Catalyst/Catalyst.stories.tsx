import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockHwWallet, mockOsWallet, mockWallet, mockYoroiTx, QueryProvider, WithModalProps} from '../../storybook'
import {Boundary} from '../components'
import {SelectedWalletProvider} from '../SelectedWallet'
import {CatalystBackupCheckModal} from './CatalystBackupCheckModal'
import {Step1} from './Step1'
import {Step2} from './Step2'
import {Step3} from './Step3'
import {Step4} from './Step4'
import {Step5} from './Step5'
import {Step6} from './Step6'

storiesOf('Catalyst', module)
  .add('Step 1, staked', () => (
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
          <Step1 setPin={action('setPin')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('Step 1, notStaked ', () => (
    <QueryProvider>
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          getDelegationStatus: async (...args) => {
            action('getDelegationStatus', ...args)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return {isRegistered: false}
          },
        }}
      >
        <Boundary>
          <Step1 setPin={action('setPin')} />
        </Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('Step 2', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mockWallet}>
        <Step2 pin="1234" />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('Step 3, loading', () => (
    <QueryProvider>
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          createVotingRegTx: (...args) => {
            action('createVotingRegTx')(...args)
            return new Promise(() => null)
          },
        }}
      >
        <Step3 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))
  .add('Step 3, error', () => (
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
        <Step3 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))
  .add('Step 3, success', () => (
    <QueryProvider>
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          createVotingRegTx: (...args) => {
            action('createVotingRegTx')(...args)
            return Promise.resolve(mockYoroiTx)
          },
        }}
      >
        <Step3 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('Step 3, hw, loading', () => (
    <QueryProvider>
      <SelectedWalletProvider
        wallet={{
          ...mockHwWallet,
          createVotingRegTx: (...args) => {
            action('createVotingRegTx')(...args)
            return new Promise(() => null)
          },
        }}
      >
        <Step3 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))
  .add('Step 3, hw, error', () => (
    <QueryProvider>
      <SelectedWalletProvider
        wallet={{
          ...mockHwWallet,
          createVotingRegTx: (...args) => {
            action('createVotingRegTx')(...args)
            return Promise.reject(new Error('createVotingRegTx: error message'))
          },
        }}
      >
        <Step3 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))
  .add('Step 3, hw, success', () => (
    <QueryProvider>
      <SelectedWalletProvider
        wallet={{
          ...mockHwWallet,
          createVotingRegTx: (...args) => {
            action('createVotingRegTx')(...args)
            return Promise.resolve(mockYoroiTx)
          },
        }}
      >
        <Step3 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('Step 4, password', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mockWallet}>
        <Step4 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('Step 4, hw', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mockHwWallet}>
        <Step4 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('Step 4, os', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mockOsWallet}>
        <Step4 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('Step 5, password', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mockWallet}>
        <Step5 yoroiUnsignedTx={mockYoroiTx} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('Step 5, hw', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mockHwWallet}>
        <Step5 yoroiUnsignedTx={mockYoroiTx} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('Step 5, os', () => (
    <QueryProvider>
      <SelectedWalletProvider wallet={mockOsWallet}>
        <Step5 yoroiUnsignedTx={mockYoroiTx} />
      </SelectedWalletProvider>
    </QueryProvider>
  ))

  .add('Step 6', () => <Step6 catalystSKHexEncrypted="catalystSKHexEncrypted" />)
  .add('CatalystBackupCheckModal', () => (
    <QueryProvider>
      <WithModalProps>
        {(modalProps) => <CatalystBackupCheckModal {...modalProps} onConfirm={action('onConfirm')} />}
      </WithModalProps>
    </QueryProvider>
  ))
