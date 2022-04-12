import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {BigNumber} from 'bignumber.js'
import React from 'react'

import {WithModalProps} from '../../../../../storybook'
import {Modal} from '../../../../components'
import {NETWORKS, PRIMARY_ASSET_CONSTANTS} from '../../../../legacy/networks'
import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {MultiToken, YoroiWallet} from '../../../../yoroi-wallets'
import {TransferSummary} from './TransferSummary'

const other = {
  // arbitrary values controlled by parent
  balance: new BigNumber(9827635),
  finalBalance: new BigNumber(1923745),
  fees: new BigNumber(28934756),

  onCancel: action('onCancel'),
  onConfirm: action('onConfirm'),
}

const wallet = {
  networkId: 1,
  isEasyConfirmationEnabled: true,
  isHW: false,
} as YoroiWallet

storiesOf('TransferSummary', module)
  .add('withdrawals, no registrations', () => {
    const withdrawals = [
      {
        address: 'withdrawal address 1',
        amount: new MultiToken(
          [
            {
              amount: new BigNumber(1900001),
              identifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
              networkId: NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
            },
          ],
          {
            defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
            defaultNetworkId: NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
          },
        ),
      },
    ]
    const deregistrations = null

    return (
      <WithModalProps>
        {(modalProps) => (
          <SelectedWalletProvider wallet={wallet}>
            <Modal {...modalProps} showCloseIcon>
              <TransferSummary withdrawals={withdrawals} deregistrations={deregistrations} {...other} />
            </Modal>
          </SelectedWalletProvider>
        )}
      </WithModalProps>
    )
  })
  .add('deregistrations, no withdrawals', () => {
    const withdrawals = null
    const deregistrations = [
      {
        rewardAddress: 'deregistration address',
        refund: new MultiToken(
          [
            {
              identifier: '',
              networkId: 300,
              amount: new BigNumber(1000),
            },
            {
              identifier: '',
              networkId: 300,
              amount: new BigNumber(1000),
            },
          ],
          {
            defaultIdentifier: '',
            defaultNetworkId: 300,
          },
        ),
      },
    ]

    return (
      <WithModalProps>
        {(modalProps) => (
          <SelectedWalletProvider wallet={wallet}>
            <Modal {...modalProps} showCloseIcon>
              <TransferSummary withdrawals={withdrawals} deregistrations={deregistrations} {...other} />
            </Modal>
          </SelectedWalletProvider>
        )}
      </WithModalProps>
    )
  })
  .add('deregistrations, withdrawals', () => {
    const withdrawals = [
      {
        address: 'withdrawal address 1',
        amount: new MultiToken([], {
          defaultIdentifier: '',
          defaultNetworkId: 300,
        }),
      },
    ]
    const deregistrations = [
      {
        rewardAddress: 'deregistration address',
        refund: new MultiToken(
          [
            {
              identifier: '',
              networkId: 300,
              amount: new BigNumber(1000),
            },
            {
              identifier: '',
              networkId: 300,
              amount: new BigNumber(1000),
            },
          ],
          {
            defaultIdentifier: '',
            defaultNetworkId: 300,
          },
        ),
      },
    ]

    return (
      <WithModalProps>
        {(modalProps) => (
          <SelectedWalletProvider wallet={wallet}>
            <Modal {...modalProps} showCloseIcon>
              <TransferSummary withdrawals={withdrawals} deregistrations={deregistrations} {...other} />
            </Modal>
          </SelectedWalletProvider>
        )}
      </WithModalProps>
    )
  })
  .add('no withdrawals, no deregistrations', () => {
    const withdrawals = null
    const deregistrations = null

    return (
      <WithModalProps>
        {(modalProps) => (
          <SelectedWalletProvider wallet={wallet}>
            <Modal {...modalProps} showCloseIcon>
              <TransferSummary withdrawals={withdrawals} deregistrations={deregistrations} {...other} />
            </Modal>
          </SelectedWalletProvider>
        )}
      </WithModalProps>
    )
  })
