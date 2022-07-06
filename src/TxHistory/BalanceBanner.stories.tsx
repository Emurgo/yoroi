import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mockWallet} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {BalanceBanner} from './BalanceBanner'

storiesOf('V2/BalanceBanner', module)
  .add('loading', () => {
    return (
      <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>
        <SelectedWalletProvider
          wallet={{
            ...mockWallet,
            fetchCurrentPrice: () => new Promise(() => undefined), // never resolves
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
            ...mockWallet,
            fetchCurrentPrice: () => Promise.resolve(12.123),
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
            ...mockWallet,
            fetchCurrentPrice: () => Promise.reject(new Error('Some error message')),
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
