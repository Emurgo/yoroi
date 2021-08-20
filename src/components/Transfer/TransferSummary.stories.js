// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'
import {BigNumber} from 'bignumber.js'

import {Modal} from '../UiKit'
import TransferSummary from './TransferSummary'
import {action} from '@storybook/addon-actions'
import {MultiToken} from '../../crypto/MultiToken'
import {NETWORKS, PRIMARY_ASSET_CONSTANTS} from '../../config/networks'
import {withModalProps} from '../../../storybook'

const other = {
  // arbitrary values controlled by parent
  balance: new BigNumber(9827635),
  finalBalance: new BigNumber(1923745),
  fees: new BigNumber(28934756),

  onCancel: action('onCancel'),
  onConfirm: action('onConfirm'),
}

storiesOf('TransferSummary', module)
  .addDecorator(withModalProps)
  .add('withdrawals, no registrations', (modalProps) => {
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
    const deregistrations = undefined

    return (
      <Modal {...modalProps} showCloseIcon>
        <TransferSummary withdrawals={withdrawals} deregistrations={deregistrations} {...other} />
      </Modal>
    )
  })
  .add('deregistrations, no withdrawals', (modalProps) => {
    const withdrawals = undefined
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
      <Modal {...modalProps} showCloseIcon>
        <TransferSummary withdrawals={withdrawals} deregistrations={deregistrations} {...other} />
      </Modal>
    )
  })
  .add('deregistrations, withdrawals', (modalProps) => {
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
      <Modal {...modalProps} showCloseIcon>
        <TransferSummary withdrawals={withdrawals} deregistrations={deregistrations} {...other} />
      </Modal>
    )
  })
  .add('no withdrawals, no deregistrations', (modalProps) => {
    const withdrawals = undefined
    const deregistrations = undefined

    return (
      <Modal {...modalProps} showCloseIcon>
        <TransferSummary withdrawals={withdrawals} deregistrations={deregistrations} {...other} />
      </Modal>
    )
  })
