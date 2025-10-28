// Onboarding Events
export type OnboardingEvent =
  | 'Onboarding Pin Code Page Viewed'
  | 'Onboarding Biometrics Page Viewed'
  | 'Onboarding Theme Page Viewed'

// Send Events
export type SendEvent = 'Send Initiated' | 'Send Select Asset Page Viewed'

// Transaction Review Events
export type TransactionReviewEvent =
  | 'Transaction Review Modal Viewed'
  | 'Transaction Review Submit Modal Viewed'
  | 'Transaction Results Popup Viewed'

export type TransactionReviewProperties = {
  'Transaction Review Modal Viewed': {
    type: string
    asset_count: number
    asset_list: string
  }
  'Transaction Review Submit Modal Viewed': undefined
  'Transaction Results Popup Viewed': {
    status: 'Success' | 'Failure'
  }
}

// Staking Events
export type StakingEvent = 'Staking Center Page Viewed'

// Governance Events
export type GovernanceEvent = 'Governance Dashboard Page Viewed'

// Fiat Ramp Events
export type FiatRampEvent =
  | 'Wallet Page Buy Banner Clicked'
  | 'Wallet Page Exchange Clicked'

// Swap Events
export type SwapEvent = 'Swap Initiated' | 'Swap Review Page Viewed'

// Portfolio Events
export type PortfolioEvent =
  | 'Portfolio Dashboard Page Viewed'
  | 'Portfolio Tokens List Page Viewed'

// NFT Events
export type NFTEvent =
  | 'NFT Gallery Page Viewed'
  | 'NFT Gallery Details Page Viewed'

export type NFTProperties = {
  'NFT Gallery Page Viewed': {
    nft_count: number
  }
  'NFT Gallery Details Page Viewed': undefined
}

// Dapps Events
export type DappsEvent =
  | 'Discover Page Viewed'
  | 'Dapp Connector Sign Transaction Submitted'
  | 'Dapp Connector Sign Transaction Page Viewed'
  | 'Discover Web View Viewed'

export type DappsProperties = {
  'Discover Page Viewed': undefined
  'Dapp Connector Sign Transaction Submitted': undefined
  'Dapp Connector Sign Transaction Page Viewed': {
    asset_count: number
    asset_list: string[]
  }
  'Discover Web View Viewed': undefined
}

// Receive Events
export type ReceiveEvent = 'Receive Page Viewed' | 'Receive Page List Viewed'

// Wallet Management Events
export type WalletManagementEvent =
  | 'All Wallets Page Viewed'
  | 'Connect Wallet Check Page Viewed'
  | 'Connect Wallet Connect Page Viewed'
  | 'Connect Wallet Details Page Viewed'
  | 'Connect Wallet Details Submitted'
  | 'Create Wallet Select Method Page Viewed'
  | 'Create Wallet Learn Phrase Step Viewed'
  | 'Create Wallet Save Phrase Step Viewed'
  | 'Create Wallet Verify Phrase Step Viewed'
  | 'Create Wallet Details Submitted'
  | 'Restore Wallet Type Step Viewed'
  | 'Restore Wallet Enter Phrase Step Viewed'
  | 'Restore Wallet Details Step Viewed'

export type WalletManagementProperties = {
  'All Wallets Page Viewed': undefined
  'Connect Wallet Check Page Viewed': undefined
  'Connect Wallet Connect Page Viewed': undefined
  'Connect Wallet Details Page Viewed': undefined
  'Connect Wallet Details Submitted': {
    hardware_wallet: 'Trezor' | 'Ledger'
  }
  'Create Wallet Select Method Page Viewed': undefined
  'Create Wallet Learn Phrase Step Viewed': undefined
  'Create Wallet Save Phrase Step Viewed': undefined
  'Create Wallet Verify Phrase Step Viewed': undefined
  'Create Wallet Details Submitted': undefined
  'Restore Wallet Type Step Viewed': undefined
  'Restore Wallet Enter Phrase Step Viewed': undefined
  'Restore Wallet Details Step Viewed': undefined
}

// Catalyst Voting Events
export type CatalystVotingEvent = 'Voting Page Viewed'

// Settings Events
export type SettingsEvent = 'Settings Page Viewed'

// Landing Events
export type LandingEvent = 'Transactions Page Viewed'

// Union of all events
export type AnalyticsEvent =
  | OnboardingEvent
  | SendEvent
  | TransactionReviewEvent
  | StakingEvent
  | GovernanceEvent
  | FiatRampEvent
  | SwapEvent
  | PortfolioEvent
  | NFTEvent
  | DappsEvent
  | ReceiveEvent
  | WalletManagementEvent
  | CatalystVotingEvent
  | SettingsEvent
  | LandingEvent

// Properties for events that need them
export type AnalyticsEventProperties = TransactionReviewProperties &
  NFTProperties &
  DappsProperties &
  WalletManagementProperties & {
    // Events without properties
    [K in Exclude<
      AnalyticsEvent,
      keyof (TransactionReviewProperties &
        NFTProperties &
        DappsProperties &
        WalletManagementProperties)
    >]: undefined
  }
