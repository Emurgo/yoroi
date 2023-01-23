import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {BalanceBanner} from './BalanceBanner'

storiesOf('V2/BalanceBanner', module)
  .add('loading', () => {
    return (
      <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            fetchCurrentPrice: mocks.fetchCurrentPrice.loading,
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <BalanceBanner />
            </View>
          </View>
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('success', () => {
    return (
      <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            fetchCurrentPrice: mocks.fetchCurrentPrice.success,
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <BalanceBanner />
            </View>
          </View>
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('error', () => {
    return (
      <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            fetchCurrentPrice: mocks.fetchCurrentPrice.error,
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <BalanceBanner />
            </View>
          </View>
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
