import {WalletChecksum} from '@emurgo/cip4-js'
import type {IntlShape} from 'react-intl'

export interface WalletInterface {
  walletImplementationId: string
  networkId: number
  checksum: WalletChecksum
  isReadOnly: boolean
  isHW: boolean
  isEasyConfirmationEnabled: boolean
  changePassword(masterPassword: string, newPassword: string, intl: IntlShape): Promise<void>
}
export type WalletImplementation = {
  WALLET_IMPLEMENTATION_ID: 'haskell-byron' | 'haskell-shelley' | 'haskell-shelley-24' | 'jormungandr-itn' | ''
  TYPE: 'bip44' | 'cip1852'
  MNEMONIC_LEN: number
  DISCOVERY_GAP_SIZE: number
  DISCOVERY_BLOCK_SIZE: number
  MAX_GENERATED_UNUSED: number
}

export type WalletImplementationId = WalletImplementation['WALLET_IMPLEMENTATION_ID']

export type NetworkId = number

export type Device = {
  id: number
  name: string
}
