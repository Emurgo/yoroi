import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockKeyStore, mockWallet, mockYoroiSignedTx, mockYoroiTx, WithModal} from '../../../storybook'
import {YoroiWallet} from '../../yoroi-wallets'
import {WithdrawStakingRewards} from './WithdrawStakingRewards'

storiesOf('Withdrawal/password', module)
  .add('success', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.success,
          signTx: sign.success,
          submitTransaction: submit.success,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('create/loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.loading,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('create/error', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.error,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('sign/loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.success,
          signTx: sign.loading,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('sign/error', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.success,
          signTx: sign.error,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('submit/loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.success,
          signTx: sign.success,
          submitTransaction: submit.loading,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('submit/error', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.success,
          signTx: sign.success,
          submitTransaction: submit.error,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))

storiesOf('Withdrawal/hw', module)
  .add('success', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          isHW: true,
          createWithdrawalTx: create.success,
          signTx: sign.success,
          submitTransaction: submit.success,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('create/loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.loading,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('create/error', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.error,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('sign/loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.success,
          signTx: sign.loading,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('sign/error', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.success,
          signTx: sign.error,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('submit/loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.success,
          signTx: sign.success,
          submitTransaction: submit.loading,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('submit/error', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.success,
          signTx: sign.success,
          submitTransaction: submit.error,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))

storiesOf('Withdrawal/os', module)
  .add('success', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          isEasyConfirmationEnabled: true,
          createWithdrawalTx: create.success,
          signTx: sign.success,
          submitTransaction: submit.success,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('create/loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.loading,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('create/error', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.error,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('sign/loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.success,
          signTx: sign.loading,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('sign/error', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.success,
          signTx: sign.error,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('submit/loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.success,
          signTx: sign.success,
          submitTransaction: submit.loading,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))
  .add('submit/error', () => (
    <WithModal>
      <WithdrawStakingRewards
        wallet={{
          ...mockWallet,
          createWithdrawalTx: create.success,
          signTx: sign.success,
          submitTransaction: submit.error,
        }}
        storage={mockKeyStore()}
        onSuccess={action('onSuccess')}
        onCancel={action('onCancel')}
      />
    </WithModal>
  ))

const create = {
  success: (async (utxos, shouldDeregister, serverTime) => {
    action('createWithdrawalTx')({utxos, shouldDeregister, serverTime})
    await delay(1000)
    return mockYoroiTx
  }) as YoroiWallet['createWithdrawalTx'],
  loading: (async (utxos, shouldDeregister, serverTime) => {
    action('createWithdrawalTx')({utxos, shouldDeregister, serverTime})
    await delay(1000)
    return neverResolves
  }) as YoroiWallet['createWithdrawalTx'],
  error: (async (utxos, shouldDeregister, serverTime) => {
    action('createWithdrawalTx')({utxos, shouldDeregister, serverTime})
    await delay(1000)
    return Promise.reject(new Error('Insufficient funds'))
  }) as YoroiWallet['createWithdrawalTx'],
}

const sign = {
  success: (async (unsignedTx) => {
    action('signTx')(unsignedTx)
    await delay(1000)
    return mockYoroiSignedTx
  }) as YoroiWallet['signTx'],
  loading: (async (unsignedTx) => {
    action('signTx')(unsignedTx)
    await delay(1000)
    return neverResolves
  }) as YoroiWallet['signTx'],
  error: (async (unsignedTx) => {
    action('signTx')(unsignedTx)
    await delay(1000)
    return Promise.reject(new Error('Unknown error'))
  }) as YoroiWallet['signTx'],
}

const submit = {
  success: (async (signedTx) => {
    action('submitTransaction')(signedTx)
    await delay(1000)
    return []
  }) as YoroiWallet['submitTransaction'],
  loading: (async (signedTx) => {
    action('submitTransaction')(signedTx)
    await delay(1000)
    return neverResolves
  }) as YoroiWallet['submitTransaction'],
  error: (async (signedTx) => {
    action('submitTransaction')(signedTx)
    await delay(1000)
    return Promise.reject(new Error('Unknown error'))
  }) as YoroiWallet['submitTransaction'],
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const neverResolves = new Promise((_resolve) => undefined) // never resolves
