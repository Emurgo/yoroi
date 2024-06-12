import {WalletAddressMode, WalletImplementation} from './wallet'

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

  // authorization
  readonly isHW: boolean
  isEasyConfirmationEnabled: boolean
}
