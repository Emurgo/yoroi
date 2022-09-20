import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockHwWallet, mockKeyStore, mockYoroiSignedTx, mockYoroiTx, WithModal} from '../../../storybook'
import {WithdrawStakingRewards} from './WithdrawStakingRewards'

storiesOf('WithdrawStakingRewards', module)
  .add('createWithdrawalTx: loading', () => (
    <WithModal>
      <WithdrawStakingRewards //
        wallet={{
          ...mockHwWallet,
          createWithdrawalTx: () => new Promise(() => undefined), // never resolves
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('createWithdrawalTx: error', () => (
    <WithModal>
      <WithdrawStakingRewards //
        wallet={{
          ...mockHwWallet,
          createWithdrawalTx: () => Promise.reject(new Error('storybook error message')),
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('signTx: loading', () => (
    <WithModal>
      <WithdrawStakingRewards //
        wallet={{
          ...mockHwWallet,
          createWithdrawalTx: () => Promise.resolve(mockYoroiTx),
          signTxWithLedger: () => new Promise(() => undefined), // never resolves
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('signTx: error', () => (
    <WithModal>
      <WithdrawStakingRewards //
        wallet={{
          ...mockHwWallet,
          createWithdrawalTx: () => Promise.resolve(mockYoroiTx),
          signTxWithLedger: () => Promise.reject(new Error('storybook error message')),
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('submitTransaction: loading', () => (
    <WithModal>
      <WithdrawStakingRewards //
        wallet={{
          ...mockHwWallet,
          createWithdrawalTx: () => Promise.resolve(mockYoroiTx),
          signTxWithLedger: () => Promise.resolve(mockYoroiSignedTx),
          submitTransaction: () => new Promise(() => undefined), // never resolves
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('submitTransaction: error', () => (
    <WithModal>
      <WithdrawStakingRewards //
        wallet={{
          ...mockHwWallet,
          createWithdrawalTx: () => Promise.resolve(mockYoroiTx),
          signTxWithLedger: () => Promise.resolve(mockYoroiSignedTx),
          submitTransaction: () => Promise.reject(new Error('storybook error message')),
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
