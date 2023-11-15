import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {QueryProvider} from '../../../.storybook/decorators'
import {SelectedWalletProvider} from '../../SelectedWallet'
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
              <PairedBalance amount={{quantity: '2', tokenId: mocks.wallet.primaryTokenInfo.id}} />
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
              <PairedBalance amount={{quantity: '2', tokenId: mocks.wallet.primaryTokenInfo.id}} />
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
              <PairedBalance amount={{quantity: '2', tokenId: mocks.wallet.primaryTokenInfo.id}} isPrivacyOff />
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
              <PairedBalance amount={{quantity: '2', tokenId: mocks.wallet.primaryTokenInfo.id}} />
            </View>
          </View>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
