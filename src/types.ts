import {WalletChecksum} from '@emurgo/cip4-js'
import type {IntlShape} from 'react-intl'

export type WalletMeta = {
  id: string
  name: string
  networkId: number
  walletImplementationId: string
  isHW: boolean
  isShelley?: boolean | undefined | null // legacy jormungandr
  isEasyConfirmationEnabled: boolean
  checksum: WalletChecksum
  provider?: string
}

export interface WalletInterface {
  walletImplementationId: string
  checksum: WalletChecksum
  changePassword(masterPassword: string, newPassword: string, intl: IntlShape): Promise<void>
  fetchFundInfo(): Promise<FundInfos>
}

// CATALYST
export type FundInfos = {
  currentFund?: FundInfo
  nextFund?: FundInfo
}

type FundInfo = {
  id: number
  registrationStart: string
  registrationEnd: string
  votingStart?: string
  votingEnd?: string
  votingPowerThreshold: string // in ada
}
