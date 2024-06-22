import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {QueryProvider} from '../../../.storybook/decorators'
import {mocks} from '../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {BalanceBanner} from './BalanceBanner'

storiesOf('BalanceBanner', module)
  .add('loading', () => {
    return (
      <QueryProvider>
        <WalletManagerProviderMock
          wallet={{
            ...mocks.wallet,
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <BalanceBanner />
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
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <BalanceBanner />
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
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <BalanceBanner />
            </View>
          </View>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
