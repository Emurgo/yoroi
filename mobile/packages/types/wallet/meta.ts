import {HWDeviceInfo} from '../hw/hw'
import {
  MultisigWalletMeta,
  WalletAddressMode,
  WalletImplementation,
} from './wallet'

export type WalletMeta = {
  // identification
  readonly version: number // it follows storage version
  readonly id: string
  readonly plate: string
  name: string
  avatar: string

  // operation
  readonly implementation: WalletImplementation
  addressMode: WalletAddressMode
  isReadOnly: boolean
  hwDeviceInfo: HWDeviceInfo | null

  // authorization
  readonly isHW: boolean
  isEasyConfirmationEnabled: boolean

  // multisig wallet support (optional)
  readonly multisigMeta?: MultisigWalletMeta
}
