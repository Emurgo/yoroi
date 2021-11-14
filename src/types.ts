import type {IntlShape} from 'react-intl'

export interface WalletInterface {
  walletImplementationId: string
  checksum: {ImagePart: string; TextPart: string}
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
