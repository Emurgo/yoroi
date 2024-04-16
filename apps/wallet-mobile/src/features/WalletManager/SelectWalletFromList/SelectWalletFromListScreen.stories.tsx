import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WalletMeta} from '../../../wallet-manager/types'
import {mockWalletManager, WalletManager} from '../../../wallet-manager/walletManager'
import {WalletManagerProvider} from '../../../wallet-manager/WalletManagerContext'
import {InvalidState, NetworkError} from '../../../yoroi-wallets/cardano/errors'
import {mocks} from '../../../yoroi-wallets/mocks'
import {SelectWalletFromList} from './SelectWalletFromListScreen'

storiesOf('SelectWalletFromList', module)
  .add('no wallets', () => (
    <WalletManagerProvider
      walletManager={
        {
          ...mockWalletManager,
          listWallets: () => Promise.resolve([] as Array<WalletMeta>),
        } as WalletManager
      }
    >
      <SelectWalletFromList />
    </WalletManagerProvider>
  ))
  .add('loading', () => (
    <WalletManagerProvider
      walletManager={
        {
          ...mockWalletManager,
          listWallets: () => new Promise(() => undefined), // never resolves
        } as WalletManager
      }
    >
      <SelectWalletFromList />
    </WalletManagerProvider>
  ))
  .add('loaded', () => (
    <WalletManagerProvider
      walletManager={
        {
          ...mockWalletManager,
          listWallets: () => Promise.resolve(mockWalletMetas),
          openWallet: async (walletMeta: WalletMeta) => {
            action('openWallet')(walletMeta)
            await delay(1000)
          },
        } as unknown as WalletManager
      }
    >
      <SelectWalletFromList />
    </WalletManagerProvider>
  ))
  .add('error, no network connection ', () => (
    <WalletManagerProvider
      walletManager={
        {
          ...mockWalletManager,
          listWallets: () => Promise.resolve(mockWalletMetas),
          openWallet: async (walletMeta: WalletMeta) => {
            action('openWallet')(walletMeta)
            await delay(1000)
            throw new NetworkError()
          },
        } as unknown as WalletManager
      }
    >
      <SelectWalletFromList />
    </WalletManagerProvider>
  ))
  .add('error, invalid state ', () => (
    <WalletManagerProvider
      walletManager={
        {
          ...mockWalletManager,
          listWallets: () => Promise.resolve(mockWalletMetas),
          openWallet: async (walletMeta: WalletMeta) => {
            action('openWallet')(walletMeta)
            await delay(1000)
            throw new InvalidState()
          },
        } as unknown as WalletManager
      }
    >
      <SelectWalletFromList />
    </WalletManagerProvider>
  ))
  .add('error, unknown error ', () => (
    <WalletManagerProvider
      walletManager={
        {
          ...mockWalletManager,
          listWallets: () => Promise.resolve(mockWalletMetas),
          openWallet: async (walletMeta: WalletMeta) => {
            action('openWallet')(walletMeta)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            throw new Error('unknown error')
          },
        } as unknown as WalletManager
      }
    >
      <SelectWalletFromList />
    </WalletManagerProvider>
  ))

const delay = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

const mockWalletMetas = new Array(15).fill(null).map(() => ({
  ...mocks.walletMeta,
  id: Math.random(),
  name: `Wallet # ${String(Math.floor(Math.random() * 1000))}`,
}))
