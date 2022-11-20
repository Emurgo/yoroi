import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, mockYoroiTx, QueryProvider} from '../../../../storybook'
import {Boundary} from '../../../components'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {TransferSummary} from './TransferSummary'

storiesOf('Send/TransferSummary', module)
  // prettier-ignore
  .add('no assets', () => (
    <QueryProvider>
      <Boundary>
        <TransferSummary
          wallet={mockWallet}
          unsignedTx={
            {
              ...mockYoroiTx,
            } as YoroiUnsignedTx
          }
        />
      </Boundary>
    </QueryProvider>
  ))
  .add('assets', () => (
    <QueryProvider>
      <Boundary>
        <TransferSummary
          wallet={mockWallet}
          unsignedTx={
            {
              ...mockYoroiTx,
              amounts: {
                ...mockYoroiTx.amounts,
                '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff198.77455448': '10000',
              },
            } as YoroiUnsignedTx
          }
        />
      </Boundary>
    </QueryProvider>
  ))
