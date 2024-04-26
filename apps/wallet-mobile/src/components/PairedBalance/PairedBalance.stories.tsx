import {storiesOf} from '@storybook/react-native'
import {tokenBalanceMocks} from '@yoroi/portfolio'
import React from 'react'
import {View} from 'react-native'

import {QueryProvider} from '../../../.storybook/decorators'
import {SelectedWalletProvider} from '../../features/WalletManager/Context'
import {mocks} from '../../yoroi-wallets/mocks'
import {PairedBalance} from './PairedBalance'

storiesOf('PairedBalance', module)
  .add('loading', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            fetchCurrentPrice: mocks.fetchCurrentPrice.loading,
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <PairedBalance amount={tokenBalanceMocks.primaryETH} privacyPlaceholder="*.****" />
            </View>
          </View>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('success', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            fetchCurrentPrice: mocks.fetchCurrentPrice.success,
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <PairedBalance amount={tokenBalanceMocks.primaryETH} privacyPlaceholder="-.--" />
            </View>
          </View>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('success (privacy on)', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            fetchCurrentPrice: mocks.fetchCurrentPrice.success,
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <PairedBalance
                amount={tokenBalanceMocks.primaryETH}
                privacyPlaceholder="you should see this"
                isPrivacyOff
              />
            </View>
          </View>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('error', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            fetchCurrentPrice: mocks.fetchCurrentPrice.error,
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <PairedBalance amount={tokenBalanceMocks.primaryETH} privacyPlaceholder="hide it" />
            </View>
          </View>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
