import BigNumber from 'bignumber.js'

// Wallet Candidates

export type TransactionDirection = 'SENT' | 'RECEIVED' | 'SELF' | 'MULTI'
export type TransactionStatus = 'SUCCESSFUL' | 'PENDING' | 'FAILED'
export type TransactionAssurance = 'PENDING' | 'FAILED' | 'LOW' | 'MEDIUM' | 'HIGH'

export type Block = {
  height: number
  epoch: number
  slot: number
  hash: string
}

export type TransactionInfo = {
  id: string
  inputs: Array<IOData>
  outputs: Array<IOData>
  amount: Array<TokenEntryPlain>
  fee?: Array<TokenEntryPlain>
  delta: Array<TokenEntryPlain>
  direction: TransactionDirection
  confirmations: number
  submittedAt?: string
  lastUpdatedAt: string
  status: TransactionStatus
  assurance: TransactionAssurance
  tokens: Record<string, Token>
}

// Stake

export type Certificate =
  | 'StakeRegistration'
  | 'StakeDeregistration'
  | 'StakeDelegation'
  | 'PoolRegistration'
  | 'PoolRetirement'
  | 'MoveInstantaneousRewardsCert'

export type Withdrawal = {
  address: string // hex
  amount: string
}

export type RemoteCertificateMeta =
  | {
      kind: 'StakeRegistration'
      rewardAddress: string // hex
    }
  | {
      kind: 'StakeDeregistration'
      rewardAddress: string // hex
    }
  | {
      kind: 'StakeDelegation'
      rewardAddress: string // hex
      poolKeyHash: string // hex
    }
  | {
      kind: 'PoolRegistration'
      poolParams: unknown // we don't care about this for now
    }
  | {
      kind: 'PoolRetirement'
      poolKeyHash: string // hex
    }
  | {
      kind: 'MoveInstantaneousRewardsCert'
      rewards: Record<string, string>
      pot: 0 | 1
    }

// Transaction

export type Era = 'byron' | 'shelley'

export type RawTransaction = {
  id: string
  type?: Era
  fee?: string
  status: TransactionStatus
  inputs: Array<IOData>
  outputs: Array<IOData>
  blockNum?: number
  blockHash?: string
  txOrdinal?: number
  submittedAt?: string
  epoch?: number
  slot?: number
  lastUpdatedAt: string
  withdrawals: Array<Withdrawal>
  certificates: Array<RemoteCertificateMeta>
  validContract?: boolean
  scriptSize?: number
  collateralInputs?: Array<IOData>
}

// Utxo data

export type IOData = {
  address: string
  amount: string
  assets: Array<TokenEntry>
}

// Native assets (NFT/Tokens)

export type TokenLookupKey = {
  identifier: string
  networkId: number
}

export type TokenEntry = TokenLookupKey & {
  amount: BigNumber
}

export type TokenEntryPlain = TokenLookupKey & {
  amount: string
  isDefault: boolean
}

export type DefaultTokenEntry = {
  defaultNetworkId: number
  defaultIdentifier: string
}

export type TokenCommonMetadata = {
  numberOfDecimals: number
  ticker: null | string
  longName: null | string
  maxSupply: null | string
}

export type TokenMetadata = TokenCommonMetadata & {
  type: 'Cardano'
  policyId: string // empty string for ADA
  assetName: string // empty string for ADA
}

export type Token = {
  networkId: number
  isDefault: boolean
  /**
   * For Ergo, this is the tokenId (box id of first input in tx)
   * for Cardano, this is policyId || assetName
   * Note: we don't use null for the primary token of the chain
   * As some blockchains have multiple primary tokens
   */
  identifier: string
  metadata: TokenMetadata
}

type SendToken = {
  token: Token
  amount: string // in lovelaces
}
type SendAllToken = {
  token: Token
  shouldSendAll: true
}
export type SendTokenList = Array<SendToken | SendAllToken>

export type DefaultAssetMetadata = TokenCommonMetadata & {
  type: 'Cardano'
  policyId: string // empty string for ADA
  assetName: string // empty string for ADA
  ticker: string
}

export type DefaultAsset = Token & {
  metadata: DefaultAssetMetadata
}

// Catalyst

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
