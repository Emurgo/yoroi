import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../storybook'
import {Boundary, Icon, Spacer} from '../components'
import {SelectedWalletProvider} from '../SelectedWallet'
import {COLORS} from '../theme'
import {Balance, BalanceBanner, PairedBalance, Row} from './BalanceBanner'

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
  .add('error: error cached by the upper error boundary', () => {
    return (
      <QueryClientProvider
        client={new QueryClient({defaultOptions: {queries: {retry: false, useErrorBoundary: true}}})}
      >
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
  .add('error: error cached by the nearest error boundary', () => {
    return (
      <QueryClientProvider
        client={new QueryClient({defaultOptions: {queries: {retry: false, useErrorBoundary: true}}})}
      >
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            fetchCurrentPrice: mocks.fetchCurrentPrice.error,
          }}
        >
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{borderWidth: 1}}>
              <View style={styles.banner}>
                <Spacer height={14} />

                <Row>
                  <Icon.WalletAccount style={styles.walletIcon} iconSeed="" scalePx={7} />
                </Row>

                <Spacer height={10} />

                <TouchableOpacity onPress={() => undefined} style={styles.button}>
                  <Boundary loading={{size: 'small'}} error={{size: 'inline'}}>
                    <Row>
                      <Balance privacyMode={false} />
                    </Row>
                    <Boundary loading={{size: 'small'}} error={{size: 'inline'}}>
                      <Row>
                        <PairedBalance privacyMode={false} />
                      </Row>
                    </Boundary>
                  </Boundary>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SelectedWalletProvider>
      </QueryClientProvider>
    )
  })
  .add('error: ignored', () => {
    return (
      <QueryClientProvider
        client={new QueryClient({defaultOptions: {queries: {retry: false, useErrorBoundary: false}}})}
      >
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

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  walletIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  button: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Rubik-Medium',
    color: COLORS.ERROR_TEXT_COLOR_DARK,
  },
  totalText: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'Rubik-Regular',
    color: COLORS.TEXT_INPUT,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
