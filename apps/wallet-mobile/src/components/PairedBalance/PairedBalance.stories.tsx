import {storiesOf} from '@storybook/react-native'
import {tokenBalanceMocks} from '@yoroi/portfolio'
import React from 'react'
import {View} from 'react-native'

import {QueryProvider} from '../../../.storybook/decorators'
import {mocks} from '../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {PairedBalance} from './PairedBalance'

storiesOf('PairedBalance', module)
  .add('loading', () => {
    return (
      <QueryProvider>
        <WalletManagerProviderMock
          wallet={{
            ...mocks.wallet,
            fetchCurrentPrice: mocks.fetchCurrentPrice.loading,
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <PairedBalance amount={tokenBalanceMocks.primaryETH} />
            </View>
          </View>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
  .add('success', () => {
    return (
      <QueryProvider>
        <WalletManagerProviderMock
          wallet={{
            ...mocks.wallet,
            fetchCurrentPrice: mocks.fetchCurrentPrice.success,
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <PairedBalance amount={tokenBalanceMocks.primaryETH} />
            </View>
          </View>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
  .add('success (privacy on)', () => {
    return (
      <QueryProvider>
        <WalletManagerProviderMock
          wallet={{
            ...mocks.wallet,
            fetchCurrentPrice: mocks.fetchCurrentPrice.success,
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <PairedBalance amount={tokenBalanceMocks.primaryETH} ignorePrivacy />
            </View>
          </View>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
  .add('error', () => {
    return (
      <QueryProvider>
        <WalletManagerProviderMock
          wallet={{
            ...mocks.wallet,
            fetchCurrentPrice: mocks.fetchCurrentPrice.error,
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <PairedBalance amount={tokenBalanceMocks.primaryETH} />
            </View>
          </View>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
