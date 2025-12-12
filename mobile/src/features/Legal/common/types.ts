export type LegalAgreement = {
  latestAcceptedAgreementsDate: number
}

export const Disclaimer = {
  Swap: 'swap',
  Exchange: 'exchange',
  Dapps: 'dapps',
  Bring: 'bring',
  ShareWallet: 'shareWallet',
} as const

export type Disclaimer = (typeof Disclaimer)[keyof typeof Disclaimer]
