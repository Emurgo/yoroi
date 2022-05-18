import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, mockYoroiTx, WithModalProps} from '../../../../../storybook'
import {Boundary, Modal} from '../../../../components'
import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {TransferSummary} from './TransferSummary'

const other = {
  onCancel: action('onCancel'),
  onConfirm: action('onConfirm'),
  onConfirmBiometrics: action('onConfirmBiometrics'),
  onConfirmHW: action('onConfirmHW'),
  utxos: [],
}

storiesOf('TransferSummary', module)
  .add('withdrawals, no deregistrations', () => {
    return (
      <Boundary>
        <WithModalProps>
          {(modalProps) => (
            <SelectedWalletProvider
              wallet={{
                ...mockWallet,
                createWithdrawalTx: async () => ({
                  ...mockYoroiTx,
                  staking: {
                    ...mockYoroiTx.staking,
                    withdrawals: {
                      'reward-address': {'': '12356789'},
                    },
                  },
                }),
              }}
            >
              <Modal {...modalProps} showCloseIcon>
                <TransferSummary shouldDeregister={false} {...other} />
              </Modal>
            </SelectedWalletProvider>
          )}
        </WithModalProps>
      </Boundary>
    )
  })
  .add('deregistrations, no withdrawals', () => {
    return (
      <WithModalProps>
        {(modalProps) => (
          <SelectedWalletProvider
            wallet={{
              ...mockWallet,
              createWithdrawalTx: async () => ({
                ...mockYoroiTx,
                staking: {
                  ...mockYoroiTx.staking,
                  deregistrations: {
                    'reward-address': {'': '2000000'},
                  },
                },
              }),
            }}
          >
            <Modal {...modalProps} showCloseIcon>
              <TransferSummary shouldDeregister={true} useUSB={true} {...other} />
            </Modal>
          </SelectedWalletProvider>
        )}
      </WithModalProps>
    )
  })
  .add('deregistrations, withdrawals', () => {
    return (
      <WithModalProps>
        {(modalProps) => (
          <SelectedWalletProvider
            wallet={{
              ...mockWallet,
              createWithdrawalTx: async () => ({
                ...mockYoroiTx,
                staking: {
                  ...mockYoroiTx.staking,
                  withdrawals: {
                    'reward-address': {'': '123456789'},
                  },
                  deregistrations: {
                    'reward-address': {'': '2000000'},
                  },
                },
              }),
            }}
          >
            <Modal {...modalProps} showCloseIcon>
              <TransferSummary shouldDeregister={true} useUSB={true} {...other} />
            </Modal>
          </SelectedWalletProvider>
        )}
      </WithModalProps>
    )
  })
  .add('no withdrawals, no deregistrations', () => {
    return (
      <WithModalProps>
        {(modalProps) => (
          <SelectedWalletProvider
            wallet={{
              ...mockWallet,
              createWithdrawalTx: async () => ({
                ...mockYoroiTx,
              }),
            }}
          >
            <Modal {...modalProps} showCloseIcon>
              <TransferSummary shouldDeregister={true} useUSB={true} {...other} />
            </Modal>
          </SelectedWalletProvider>
        )}
      </WithModalProps>
    )
  })
