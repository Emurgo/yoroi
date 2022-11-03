import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, mockYoroiTx, QueryProvider} from '../../../../storybook'
import {Boundary} from '../../../components'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {TransferSummary} from './TransferSummary'

storiesOf('TransferSummary', module)
  .add('withdrawals, no deregistrations', () => (
    <QueryProvider>
      <Boundary>
        <TransferSummary
          wallet={mockWallet}
          unsignedTx={
            {
              ...mockYoroiTx,
              staking: {
                ...mockYoroiTx.staking,
                withdrawals: {
                  'withdrawal-address': {'': '12356789'},
                },
              },
            } as YoroiUnsignedTx
          }
        />
      </Boundary>
    </QueryProvider>
  ))
  .add('deregistrations, no withdrawals', () => (
    <QueryProvider>
      <Boundary>
        <TransferSummary
          wallet={mockWallet}
          unsignedTx={
            {
              ...mockYoroiTx,
              staking: {
                ...mockYoroiTx.staking,
                deregistrations: {
                  'deregistration-address': {'': '2000000'},
                },
              },
            } as YoroiUnsignedTx
          }
        />
      </Boundary>
    </QueryProvider>
  ))
  .add('deregistrations, withdrawals', () => (
    <QueryProvider>
      <Boundary>
        <TransferSummary
          wallet={mockWallet}
          unsignedTx={
            {
              ...mockYoroiTx,
              staking: {
                ...mockYoroiTx.staking,
                deregistrations: {
                  'deregistration-address': {'': '2000000'},
                },
                withdrawals: {
                  'withdrawal-address': {'': '12356789'},
                },
              },
            } as YoroiUnsignedTx
          }
        />
      </Boundary>
    </QueryProvider>
  ))
