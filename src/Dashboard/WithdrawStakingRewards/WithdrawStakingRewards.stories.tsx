import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockHwWallet, mockWallet, mockYoroiSignedTx, mockYoroiTx, WithModal} from '../../../storybook'
import {StakingInfo} from '../../yoroi-wallets/types'
import {WithdrawStakingRewards} from './WithdrawStakingRewards'

storiesOf('WithdrawStakingRewards', module)
  .add('create: loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: LOADING,
        }}
      />
    </WithModal>
  ))
  .add('create: error', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: FAILED,
        }}
      />
    </WithModal>
  ))

  .add('signTx: loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: async () => mockYoroiTx,
          signTx: LOADING,
        }}
      />
    </WithModal>
  ))
  .add('signTx: error', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: async () => mockYoroiTx,
          signTx: FAILED,
        }}
      />
    </WithModal>
  ))

  .add('submitTransaction: loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: async () => mockYoroiTx,
          signTx: async () => mockYoroiSignedTx,
          submitTransaction: LOADING,
        }}
      />
    </WithModal>
  ))
  .add('submitTransaction: error', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: async () => mockYoroiTx,
          signTx: async () => mockYoroiSignedTx,
          submitTransaction: FAILED,
        }}
      />
    </WithModal>
  ))

  .add('success', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: async () => mockYoroiTx,
          signTx: async () => mockYoroiSignedTx,
          submitTransaction: async () => [],
        }}
      />
    </WithModal>
  ))
  .add('no rewards, success', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockWallet,
          getStakingInfo: async () => ({
            ...mockStakingInfo,
            rewards: '0',
          }),
          createWithdrawalTx: async () => mockYoroiTx,
          signTx: async () => mockYoroiSignedTx,
          submitTransaction: async () => [],
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
          ...mockHwWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: LOADING,
        }}
      />
    </WithModal>
  ))
  .add('isHW, create: error', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockHwWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: FAILED,
        }}
      />
    </WithModal>
  ))

  .add('isHW, signTx: loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockHwWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: async () => mockYoroiTx,
          signTxWithLedger: LOADING,
        }}
      />
    </WithModal>
  ))
  .add('isHW, signTx: error', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockHwWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: async () => mockYoroiTx,
          signTxWithLedger: FAILED,
        }}
      />
    </WithModal>
  ))

  .add('isHW, submitTransaction: loading', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockHwWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: async () => mockYoroiTx,
          signTxWithLedger: async () => mockYoroiSignedTx,
          submitTransaction: LOADING,
        }}
      />
    </WithModal>
  ))
  .add('isHW, submitTransaction: error', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockHwWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: async () => mockYoroiTx,
          signTxWithLedger: async () => mockYoroiSignedTx,
          submitTransaction: FAILED,
        }}
      />
    </WithModal>
  ))

  .add('isHW, success', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockHwWallet,
          getStakingInfo: async () => mockStakingInfo,
          createWithdrawalTx: async () => mockYoroiTx,
          signTxWithLedger: async () => mockYoroiSignedTx,
          submitTransaction: async () => [],
        }}
      />
    </WithModal>
  ))
  .add('isHW, no rewards, success', () => (
    <WithModal>
      <WithdrawStakingRewards
        {...commonProps}
        wallet={{
          ...mockHwWallet,
          getStakingInfo: async () => ({
            ...mockStakingInfo,
            rewards: '0',
          }),
          createWithdrawalTx: async () => mockYoroiTx,
          signTxWithLedger: async () => mockYoroiSignedTx,
          submitTransaction: async () => [],
        }}
      />
    </WithModal>
  ))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LOADING = (): Promise<any> => new Promise(() => null)
const FAILED = () => Promise.reject(new Error('storybook error message'))

const mockStakingInfo: StakingInfo = {
  status: 'staked',
  amount: '123456789',
  rewards: '123',
  poolId: 'poolId',
}

const commonProps = {
  onSuccess: action('onSuccess'),
  onCancel: action('onCancel'),
}
