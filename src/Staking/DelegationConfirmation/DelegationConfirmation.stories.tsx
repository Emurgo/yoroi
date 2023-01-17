import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks, RouteProvider} from '../../../storybook'
import {getDefaultAssets} from '../../legacy/config'
import {StakingCenterRoutes} from '../../navigation'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {DelegationConfirmation} from './DelegationConfirmation'

storiesOf('DelegationConfirmation', module)
  .add('Default', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider
        wallet={{
          ...mocks.wallet,
          primaryToken: getDefaultAssets()[0],
          fetchPoolInfo: mocks.fetchPoolInfo.success.poolFound,
        }}
      >
        <RouteProvider params={params}>
          <DelegationConfirmation />
        </RouteProvider>
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))
  .add('loading', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider
        wallet={{
          ...mocks.wallet,
          primaryToken: getDefaultAssets()[0],
          fetchPoolInfo: mocks.fetchPoolInfo.loading,
        }}
      >
        <RouteProvider params={params}>
          <DelegationConfirmation />
        </RouteProvider>
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))
  .add('error', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider
        wallet={{
          ...mocks.wallet,
          primaryToken: getDefaultAssets()[0],
          fetchPoolInfo: mocks.fetchPoolInfo.error,
        }}
      >
        <RouteProvider params={params}>
          <DelegationConfirmation />
        </RouteProvider>
      </SelectedWalletProvider>
    </QueryClientProvider>
  ))

const params: StakingCenterRoutes['delegation-confirmation'] = {
  poolId: '6777ed5eac05ab8bf55d073424132e200935c8d3be62fb00f5252cd27a9fe6e5',
  yoroiUnsignedTx: {
    ...mocks.yoroiUnsignedTx,
    staking: {
      registrations: {},
      deregistrations: {},
      delegations: {
        rewardAddress: {'': '123456789'},
      },
      withdrawals: {},
    },
  },
}
