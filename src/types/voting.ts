export type FundInfos = {
  currentFund: FundInfo
  nextFund: FundInfo
}

export type FundInfo = {
  id: number
  registrationStart: string
  registrationEnd: string
  votingStart: string
  votingEnd: string
  votingPowerThreshold: string // in ADA
}
