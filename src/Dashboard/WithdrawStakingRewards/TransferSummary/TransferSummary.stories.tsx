import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, mockYoroiTx, WithModal} from '../../../../storybook'
import {Boundary} from '../../../components'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {TransferSummary} from './TransferSummary'

storiesOf('TransferSummary', module)
  .add('withdrawals, no deregistrations', () => (
    <WithModal>
      <Boundary>
        <TransferSummary
          wallet={mockWallet}
          unsignedTx={
            {
              ...mockYoroiTx,
              staking: {
                ...mockYoroiTx.staking,
                withdrawals: {
                  'reward-address': {'': '12356789'},
                },
              },
            } as YoroiUnsignedTx
          }
        />
      </Boundary>
    </WithModal>
  ))
  .add('deregistrations, no withdrawals', () => (
    <WithModal>
      <Boundary>
        <TransferSummary
          wallet={mockWallet}
          unsignedTx={
            {
              ...mockYoroiTx,
              staking: {
                ...mockYoroiTx.staking,
                deregistrations: {
                  'reward-address': {'': '2000000'},
                },
              },
            } as YoroiUnsignedTx
          }
        />
      </Boundary>
    </WithModal>
  ))
  .add('deregistrations, no withdrawals', () => (
    <WithModal>
      <Boundary>
        <TransferSummary
          wallet={mockWallet}
          unsignedTx={
            {
              ...mockYoroiTx,
              staking: {
                ...mockYoroiTx.staking,
                deregistrations: {
                  'reward-address': {'': '2000000'},
                },
                withdrawals: {
                  'reward-address': {'': '12356789'},
                },
              },
            } as YoroiUnsignedTx
          }
        />
      </Boundary>
    </WithModal>
  ))
  .add('deregistrations, no withdrawals', () => (
    <WithModal>
      <Boundary>
        <TransferSummary wallet={mockWallet} unsignedTx={mockYoroiTx} />
      </Boundary>
    </WithModal>
  ))
