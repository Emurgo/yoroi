import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mockHwWallet, mockOsWallet, mockWallet, mockYoroiTx, WithModalProps} from '../../storybook'
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
    <QueryClientProvider client={new QueryClient()}>
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
    </QueryClientProvider>
  ))

  .add('Step 1, notStaked ', () => (
    <QueryClientProvider client={new QueryClient()}>
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
    </QueryClientProvider>
  ))

  .add('Step 2', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mockWallet}>
        <Step2 pin="1234" />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))

  .add('Step 3', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mockWallet}>
        <Step3 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))

  .add('Step 4, password', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mockWallet}>
        <Step4 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))

  .add('Step 4, hw', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mockHwWallet}>
        <Step4 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))

  .add('Step 4, os', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mockOsWallet}>
        <Step4 pin="1234" setVotingRegTxData={action('setVotingRegTxData')} />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))

  .add('Step 5, password', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mockWallet}>
        <Step5 yoroiUnsignedTx={mockYoroiTx} />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))

  .add('Step 5, hw', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mockHwWallet}>
        <Step5 yoroiUnsignedTx={mockYoroiTx} />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))

  .add('Step 5, os', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider wallet={mockOsWallet}>
        <Step5 yoroiUnsignedTx={mockYoroiTx} />
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))

  .add('Step 6', () => <Step6 catalystSKHexEncrypted="catalystSKHexEncrypted" />)
  .add('CatalystBackupCheckModal', () => (
    <QueryClientProvider client={new QueryClient()}>
      <WithModalProps>
        {(modalProps) => <CatalystBackupCheckModal {...modalProps} onConfirm={action('onConfirm')} />}
      </WithModalProps>
    </QueryClientProvider>
  ))
