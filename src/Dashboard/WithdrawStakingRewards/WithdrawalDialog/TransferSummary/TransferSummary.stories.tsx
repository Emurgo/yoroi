import {UnsignedTx} from '@emurgo/yoroi-lib-core'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, WithModalProps} from '../../../../../storybook'
import {Modal} from '../../../../components'
import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets'
import {TransferSummary} from './TransferSummary'

storiesOf('TransferSummary', module)
  .add('withdrawals, no registrations', () => {
    const unsignedTx = {
      ...mockUnsignedTx,
      fee: {'': '12345'},
      staking: {
        withdrawals: {'withdrawal address 1': {'': '1900001'}},
        deregistrations: {},
      },
    }

    return (
      <WithModalProps>
        {(modalProps) => (
          <SelectedWalletProvider wallet={mockWallet}>
            <Modal {...modalProps} showCloseIcon>
              <TransferSummary unsignedTx={unsignedTx} onConfirm={action('onConfirm')} onCancel={action('onCancel')} />
            </Modal>
          </SelectedWalletProvider>
        )}
      </WithModalProps>
    )
  })
  .add('deregistrations, no withdrawals', () => {
    const unsignedTx = {
      ...mockUnsignedTx,
      fee: {'': '12345'},
      staking: {
        withdrawals: {},
        deregistrations: {'deregistration address': {'': '2000000'}},
      },
    }

    return (
      <WithModalProps>
        {(modalProps) => (
          <SelectedWalletProvider wallet={mockWallet}>
            <Modal {...modalProps} showCloseIcon>
              <TransferSummary unsignedTx={unsignedTx} onConfirm={action('onConfirm')} onCancel={action('onCancel')} />
            </Modal>
          </SelectedWalletProvider>
        )}
      </WithModalProps>
    )
  })
  .add('deregistrations, withdrawals', () => {
    const unsignedTx = {
      ...mockUnsignedTx,
      fee: {'': '12345'},
      staking: {
        withdrawals: {'withdrawal address 1': {'': '300'}},
        deregistrations: {'deregistration address': {'': '2000000'}},
      },
    }

    return (
      <WithModalProps>
        {(modalProps) => (
          <SelectedWalletProvider wallet={mockWallet}>
            <Modal {...modalProps} showCloseIcon>
              <TransferSummary unsignedTx={unsignedTx} onConfirm={action('onConfirm')} onCancel={action('onCancel')} />
            </Modal>
          </SelectedWalletProvider>
        )}
      </WithModalProps>
    )
  })
  .add('no withdrawals, no deregistrations', () => {
    const unsignedTx = {
      ...mockUnsignedTx,
      fee: {'': '12345'},
    }

    return (
      <WithModalProps>
        {(modalProps) => (
          <SelectedWalletProvider wallet={mockWallet}>
            <Modal {...modalProps} showCloseIcon>
              <TransferSummary unsignedTx={unsignedTx} onConfirm={action('onConfirm')} onCancel={action('onCancel')} />
            </Modal>
          </SelectedWalletProvider>
        )}
      </WithModalProps>
    )
  })

const mockUnsignedTx: YoroiUnsignedTx = {
  amounts: {},
  fee: {},
  auxiliary: {},
  entries: {},
  change: {},
  staking: {
    withdrawals: {},
    deregistrations: {},
  },
  unsignedTx: {} as unknown as UnsignedTx,
}
