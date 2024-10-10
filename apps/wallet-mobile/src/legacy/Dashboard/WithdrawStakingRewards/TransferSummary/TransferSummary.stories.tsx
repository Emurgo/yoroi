import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider} from '../../../../../.storybook/decorators'
import {Boundary} from '../../../../components/Boundary/Boundary'
import {mocks} from '../../../../yoroi-wallets/mocks/wallet'
import {TransferSummary} from './TransferSummary'

storiesOf('TransferSummary', module)
  .add('withdrawals, no deregistrations', () => (
    <QueryProvider>
      <Boundary>
        <TransferSummary
          wallet={mocks.wallet}
          unsignedTx={{
            ...mocks.yoroiUnsignedTx,
            staking: {
              ...mocks.yoroiUnsignedTx.staking,
              withdrawals: [{address: 'withdrawal-address', amounts: {['.']: '12356789'}}],
            },
          }}
        />
      </Boundary>
    </QueryProvider>
  ))
  .add('deregistrations, no withdrawals', () => (
    <QueryProvider>
      <Boundary>
        <TransferSummary
          wallet={mocks.wallet}
          unsignedTx={{
            ...mocks.yoroiUnsignedTx,
            staking: {
              ...mocks.yoroiUnsignedTx.staking,
              deregistrations: [{address: 'deregistration-address', amounts: {['.']: '12356789'}}],
            },
          }}
        />
      </Boundary>
    </QueryProvider>
  ))
  .add('deregistrations, withdrawals', () => (
    <QueryProvider>
      <Boundary>
        <TransferSummary
          wallet={mocks.wallet}
          unsignedTx={{
            ...mocks.yoroiUnsignedTx,
            staking: {
              ...mocks.yoroiUnsignedTx.staking,
              deregistrations: [{address: 'deregistration-address', amounts: {['.']: '12356789'}}],
              withdrawals: [{address: 'withdrawal-address', amounts: {['.']: '12356789'}}],
            },
          }}
        />
      </Boundary>
    </QueryProvider>
  ))
