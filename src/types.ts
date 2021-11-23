import {WalletChecksum} from '@emurgo/cip4-js'
import type {IntlShape} from 'react-intl'

export interface WalletInterface {
  walletImplementationId: string
  networkId: number
  checksum: WalletChecksum
  isReadOnly: boolean
  isHW: boolean
  changePassword(masterPassword: string, newPassword: string, intl: IntlShape): Promise<void>
}
