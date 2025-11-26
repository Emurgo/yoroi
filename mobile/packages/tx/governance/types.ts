/**
 * Governance action type (CIP-1694)
 */
export type GovernanceActionType =
  | 'parameterChange'
  | 'hardFork'
  | 'treasuryWithdrawal'
  | 'infoAction'

/**
 * Governance action ID (reference to a transaction input)
 */
export type GovernanceActionId = {
  txHash: string
  txIndex: number
}

/**
 * Anchor for governance metadata
 */
export type GovernanceAnchor = {
  url: string
  hash: string // Hash of metadata (32 bytes hex)
}

/**
 * Governance action parameter value
 */
export type GovernanceActionParameterValue =
  | string
  | number
  | boolean
  | GovernanceActionParameterValue[]
  | {[key: string]: GovernanceActionParameterValue}

/**
 * Governance action
 */
export type GovernanceAction = {
  type: GovernanceActionType
  actionId?: GovernanceActionId // For voting on existing proposals
  parameters?: Record<string, GovernanceActionParameterValue> // Action-specific parameters
}

/**
 * Vote type
 */
export type VoteType = 'yes' | 'no' | 'abstain'

/**
 * Voting procedure
 */
export type VotingProcedure = {
  vote: VoteType
  anchor?: GovernanceAnchor // Optional anchor for vote metadata
}

/**
 * Voter type
 */
export type VoterType = 'drep' | 'pool' | 'committee'

/**
 * Voter identification
 */
export type Voter = {
  type: VoterType
  credential: string // Key hash or script hash (hex)
}

/**
 * Proposal data
 */
export type Proposal = {
  governanceAction: GovernanceAction
  anchor: GovernanceAnchor
  rewardAccount: string // Reward address for deposit return
  deposit: string // Deposit amount (in ADA)
}

/**
 * Vote data
 */
export type Vote = {
  voter: Voter
  governanceActionId: GovernanceActionId
  votingProcedure: VotingProcedure
}
