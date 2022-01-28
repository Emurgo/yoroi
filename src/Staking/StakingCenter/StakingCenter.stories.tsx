import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../SelectedWallet'
import {WalletInterface} from '../../types'
import {StakingCenter} from './StakingCenter'

storiesOf('StakingCenter', module).add('with 100 ADA to delegate', () => (
  <SelectedWalletProvider
    wallet={{
      ...mockWallet,
      networkId: 1,
    }}
  >
    <StakingCenter />
  </SelectedWalletProvider>
))

const mockWallet: WalletInterface = {
  id: 'wallet-id',
  walletImplementationId: 'haskell-shelley',
  networkId: 300,
  checksum: {TextPart: 'text-part', ImagePart: 'image-part'},
  isHW: false,
  isReadOnly: false,
  isEasyConfirmationEnabled: false,
  fetchPoolInfo: () => {
    throw new Error('Not implemented')
  },
  changePassword: () => {
    throw new Error('Not implemented')
  },
  getDelegationStatus: () => {
    throw new Error('Not implemented')
  },
  subscribe: () => {
    throw new Error('Not implemented')
  },
  subscribeOnTxHistoryUpdate: () => {
    throw new Error('Not implemented')
  },
  fetchAccountState: () => {
    throw new Error('Not implemented')
  },
  fetchUTXOs: () => {
    throw new Error('Not implemented')
  },
  getAllUtxosForKey: () => {
    throw new Error('Not implemented')
  },
  rewardAddressHex: 'reward-address-hex',
}
