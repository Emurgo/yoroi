import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mockWallet, mockYoroiTx, RouteProvider} from '../../../storybook'
import {getDefaultAssets} from '../../legacy/config'
import {StakingCenterRoutes} from '../../navigation'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {StakePoolInfosAndHistories} from '../../yoroi-wallets/types'
import {DelegationConfirmation} from './DelegationConfirmation'

storiesOf('DelegationConfirmation', module)
  .add('Default', () => (
    <QueryClientProvider client={new QueryClient()}>
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          defaultAsset: getDefaultAssets()[0],
          fetchPoolInfo: async () => {
            return {
              '6777ed5eac05ab8bf55d073424132e200935c8d3be62fb00f5252cd27a9fe6e5': {
                history: [
                  {
                    epoch: 123,
                    slot: 123,
                    tx_ordinal: 123,
                    cert_ordinal: 123,
                    payload: {
                      kind: 'PoolRegistration',
                      certIndex: 123,
                      poolParams: {},
                    },
                  },
                ],
                info: {
                  name: 'Emurgo',
                },
              },
            } as StakePoolInfosAndHistories
          },
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
          ...mockWallet,
          defaultAsset: getDefaultAssets()[0],
          fetchPoolInfo: async () => new Promise(() => undefined),
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
          ...mockWallet,
          defaultAsset: getDefaultAssets()[0],
          fetchPoolInfo: async () => Promise.reject(new Error('fetchPoolInfo: failed')),
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
    ...mockYoroiTx,
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
