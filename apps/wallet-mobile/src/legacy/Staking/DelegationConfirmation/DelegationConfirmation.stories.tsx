import {storiesOf} from '@storybook/react-native'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import React from 'react'

import {RouteProvider} from '../../../../.storybook/decorators'
import {StakingCenterRoutes} from '../../../kernel/navigation'
import {mocks} from '../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {DelegationConfirmation} from './DelegationConfirmation'

storiesOf('DelegationConfirmation', module)
  .add('Default', () => (
    <QueryClientProvider client={new QueryClient()}>
      <WalletManagerProviderMock
        wallet={{
          ...mocks.wallet,

          fetchPoolInfo: mocks.fetchPoolInfo.success.poolFound,
        }}
      >
        <RouteProvider params={params}>
          <DelegationConfirmation />
        </RouteProvider>
      </WalletManagerProviderMock>
    </QueryClientProvider>
  ))
  .add('loading', () => (
    <QueryClientProvider client={new QueryClient()}>
      <WalletManagerProviderMock
        wallet={{
          ...mocks.wallet,

          fetchPoolInfo: mocks.fetchPoolInfo.loading,
        }}
      >
        <RouteProvider params={params}>
          <DelegationConfirmation />
        </RouteProvider>
      </WalletManagerProviderMock>
    </QueryClientProvider>
  ))
  .add('error', () => (
    <QueryClientProvider client={new QueryClient()}>
      <WalletManagerProviderMock
        wallet={{
          ...mocks.wallet,

          fetchPoolInfo: mocks.fetchPoolInfo.error,
        }}
      >
        <RouteProvider params={params}>
          <DelegationConfirmation />
        </RouteProvider>
      </WalletManagerProviderMock>
    </QueryClientProvider>
  ))

const params: StakingCenterRoutes['delegation-confirmation'] = {
  poolId: '6777ed5eac05ab8bf55d073424132e200935c8d3be62fb00f5252cd27a9fe6e5',
  yoroiUnsignedTx: {
    ...mocks.yoroiUnsignedTx,
    staking: {
      registrations: [],
      deregistrations: [],
      delegations: [{address: 'rewardAddress', amounts: {'': '123456789'}}],
      withdrawals: [],
    },
  },
}
