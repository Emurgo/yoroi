/* eslint-disable @typescript-eslint/no-explicit-any */

import type {HWDeviceInfo} from '../../legacy/ledgerUtils'
// import {makeStorageWithPrefix} from '../storage'
import {AddressChainJSON} from './chain'
import {NetworkId, WalletImplementationId, YoroiProvider} from './types'

export type ShelleyWalletJSON = {
  version: string

  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  provider?: null | YoroiProvider

  isHW: boolean
  hwDeviceInfo: null | HWDeviceInfo
  isReadOnly: boolean
  isEasyConfirmationEnabled: boolean

  publicKeyHex?: string

  lastGeneratedAddressIndex: number
  internalChain: AddressChainJSON
  externalChain: AddressChainJSON
}

export type ByronWalletJSON = Omit<ShelleyWalletJSON, 'account'>

export type WalletJSON = ShelleyWalletJSON | ByronWalletJSON
