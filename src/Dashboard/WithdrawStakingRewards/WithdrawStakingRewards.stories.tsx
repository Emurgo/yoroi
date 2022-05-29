import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, mockYoroiTx, WithModalProps} from '../../../storybook'
import {Boundary, Modal} from '../../components'
import {Staked} from '../StakePoolInfos'
import {WithdrawalTxForm} from './WithdrawStakingRewards'

storiesOf('WithdrawalTxForm', module)
  .add('success', () => {
    const stakingInfo: Staked = {
      status: 'staked',
      poolId: 'poolId',
      amount: '123456',
      rewards: '1234',
    }

    return (
      <WithModalProps>
        {(modalProps) => (
          <Modal {...modalProps} showCloseIcon>
            <WithdrawalTxForm
              wallet={{
                ...mockWallet,
                createWithdrawalTx: async (utxos, shouldDeregister, serverTime) => {
                  action('createWithdrawalTx')({utxos, shouldDeregister, serverTime})
                  return mockYoroiTx
                },
              }}
              stakingInfo={stakingInfo}
              onDone={action('onDone')}
            />
          </Modal>
        )}
      </WithModalProps>
    )
  })
  .add('loading', () => {
    const stakingInfo: Staked = {
      status: 'staked',
      poolId: 'poolId',
      amount: '123456',
      rewards: '1234',
    }

    return (
      <WithModalProps>
        {(modalProps) => (
          <Modal {...modalProps} showCloseIcon>
            <WithdrawalTxForm
              wallet={{
                ...mockWallet,
                createWithdrawalTx: async (utxos, shouldDeregister, serverTime) => {
                  action('createWithdrawalTx')({utxos, shouldDeregister, serverTime})
                  return new Promise((_resolve, _reject) => undefined) // never resolves
                },
              }}
              stakingInfo={stakingInfo}
              onDone={action('onDone')}
            />
          </Modal>
        )}
      </WithModalProps>
    )
  })
  .add('error', () => {
    const stakingInfo: Staked = {
      status: 'staked',
      poolId: 'poolId',
      amount: '123456',
      rewards: '1234',
    }

    return (
      <WithModalProps>
        {(modalProps) => (
          <Modal {...modalProps} showCloseIcon>
            <Boundary>
              <WithdrawalTxForm
                wallet={{
                  ...mockWallet,
                  createWithdrawalTx: async (utxos, shouldDeregister, serverTime) => {
                    action('createWithdrawalTx')({utxos, shouldDeregister, serverTime})
                    return Promise.reject(new Error('Insufficient funds'))
                  },
                }}
                stakingInfo={stakingInfo}
                onDone={action('onDone')}
              />
            </Boundary>
          </Modal>
        )}
      </WithModalProps>
    )
  })
