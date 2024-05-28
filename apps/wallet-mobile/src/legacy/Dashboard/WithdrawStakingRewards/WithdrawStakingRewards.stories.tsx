import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModal} from '../../../../.storybook/decorators'
import {mocks} from '../../../yoroi-wallets/mocks'
import {WithdrawStakingRewards} from './WithdrawStakingRewards'

storiesOf('WithdrawStakingRewards', module)
  .add('create: loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.wallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createWithdrawalTx.loading,
        }}
      />
    </WithModal>
  ))
  .add('create: error', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.wallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createWithdrawalTx.error,
        }}
      />
    </WithModal>
  ))

  .add('signTx: loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.wallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createUnsignedTx.success,
          signTx: mocks.signTx.loading,
        }}
      />
    </WithModal>
  ))
  .add('signTx: error', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.wallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createWithdrawalTx.success,
          signTx: mocks.signTx.error,
        }}
      />
    </WithModal>
  ))

  .add('submitTransaction: loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.wallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createWithdrawalTx.success,
          signTx: mocks.signTx.success,
          submitTransaction: mocks.submitTransaction.loading,
        }}
      />
    </WithModal>
  ))
  .add('submitTransaction: error', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.wallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createWithdrawalTx.success,
          signTx: mocks.signTx.success,
          submitTransaction: mocks.submitTransaction.error,
        }}
      />
    </WithModal>
  ))

  .add('success', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.wallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createWithdrawalTx.success,
          signTx: mocks.signTx.success,
          submitTransaction: mocks.submitTransaction.success,
        }}
      />
    </WithModal>
  ))
  .add('no rewards, success', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.wallet,
          getStakingInfo: async () => ({
            ...mocks.stakingInfo,
            rewards: '0',
          }),
          createWithdrawalTx: mocks.createWithdrawalTx.success,
          signTx: mocks.signTx.success,
          submitTransaction: mocks.submitTransaction.success,
        }}
      />
    </WithModal>
  ))

  // isHW
  .add('isHW, create: loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.hwWallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createWithdrawalTx.loading,
        }}
      />
    </WithModal>
  ))
  .add('isHW, create: error', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.hwWallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createWithdrawalTx.error,
        }}
      />
    </WithModal>
  ))

  .add('isHW, signTx: loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.hwWallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createWithdrawalTx.success,
          signTxWithLedger: mocks.signTxWithLedger.loading,
        }}
      />
    </WithModal>
  ))
  .add('isHW, signTx: error', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.hwWallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createWithdrawalTx.success,
          signTxWithLedger: mocks.signTxWithLedger.error,
        }}
      />
    </WithModal>
  ))

  .add('isHW, submitTransaction: loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.hwWallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createWithdrawalTx.success,
          signTxWithLedger: mocks.signTxWithLedger.success,
          submitTransaction: mocks.submitTransaction.loading,
        }}
      />
    </WithModal>
  ))
  .add('isHW, submitTransaction: error', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.hwWallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createWithdrawalTx.success,
          signTxWithLedger: mocks.signTxWithLedger.success,
          submitTransaction: mocks.submitTransaction.error,
        }}
      />
    </WithModal>
  ))

  .add('isHW, success', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.hwWallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          createWithdrawalTx: mocks.createWithdrawalTx.success,
          signTxWithLedger: mocks.signTxWithLedger.success,
          submitTransaction: mocks.submitTransaction.success,
        }}
      />
    </WithModal>
  ))
  .add('isHW, no rewards, success', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mocks.hwWallet,
          getStakingInfo: async () => ({
            ...mocks.stakingInfo,
            rewards: '0',
          }),
          createWithdrawalTx: mocks.createWithdrawalTx.success,
          signTxWithLedger: mocks.signTxWithLedger.success,
          submitTransaction: mocks.submitTransaction.success,
        }}
      />
    </WithModal>
  ))

const commonProps = {
  onSuccess: action('onSuccess'),
  onCancel: action('onCancel'),
}
