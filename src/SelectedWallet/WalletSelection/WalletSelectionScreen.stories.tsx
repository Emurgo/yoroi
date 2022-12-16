import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../storybook'
import {InvalidState, NetworkError} from '../../legacy/errors'
import {WalletMeta} from '../../legacy/state'
import {WalletManagerProvider} from '../../WalletManager'
import {mockWalletManager, WalletManager} from '../../yoroi-wallets'
import {WalletSelectionScreen} from './WalletSelectionScreen'

storiesOf('WalletSelectionScreen', module)
  .add('no wallets', () => (
    <WalletManagerProvider
      walletManager={
        {
          ...mockWalletManager,
          listWallets: () => Promise.resolve([] as Array<WalletMeta>),
        } as WalletManager
      }
    >
      <WalletSelectionScreen />
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
      <WalletSelectionScreen />
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
      <WalletSelectionScreen />
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
      <WalletSelectionScreen />
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
      <WalletSelectionScreen />
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
      <WalletSelectionScreen />
    </WalletManagerProvider>
  ))

const delay = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

const mockWalletMetas = [
  {
    ...mocks.walletMeta,
    id: Math.random(),
    name: String(Math.random()),
  },
  {
    ...mocks.walletMeta,
    id: Math.random(),
    name: String(Math.random()),
  },
  {
    ...mocks.walletMeta,
    id: Math.random(),
    name: String(Math.random()),
  },
  {
    ...mocks.walletMeta,
    id: Math.random(),
    name: String(Math.random()),
  },
  {
    ...mocks.walletMeta,
    id: Math.random(),
    name: String(Math.random()),
  },
  {
    ...mocks.walletMeta,
    id: Math.random(),
    name: String(Math.random()),
  },
  {
    ...mocks.walletMeta,
    id: Math.random(),
    name: String(Math.random()),
  },
  {
    ...mocks.walletMeta,
    id: Math.random(),
    name: String(Math.random()),
  },
  {
    ...mocks.walletMeta,
    id: Math.random(),
    name: String(Math.random()),
  },
  {
    ...mocks.walletMeta,
    id: Math.random(),
    name: String(Math.random()),
  },
  {
    ...mocks.walletMeta,
    id: Math.random(),
    name: String(Math.random()),
  },
]
