import type {TransactionBuilderState} from '../transaction-builder/builder'
import type {Vote, Voter, VotingProcedure} from './types'

/**
 * Add vote to transaction builder
 *
 * Note: Voting in Cardano governance is typically done via certificates
 * (VoteDelegation) and metadata. This function helps structure the vote,
 * but actual voting may require specific certificate types.
 *
 * @param state - Transaction builder state
 * @param vote - Vote data
 * @returns Updated transaction builder state
 */
export function addVote(
  state: TransactionBuilderState,
  vote: Vote,
): TransactionBuilderState {
  // Voting is typically handled via:
  // 1. Vote delegation certificates (already supported in TransactionCertificate)
  // 2. Metadata with vote information

  const voteMetadata = {
    governanceActionId: vote.governanceActionId,
    votingProcedure: vote.votingProcedure,
    voter: vote.voter,
  }

  // Add vote metadata
  // Note: Actual vote labels would be defined by governance spec
  return {
    ...state,
    metadata: [
      ...state.metadata,
      {
        label: 'governance_vote', // Placeholder - actual label would be from CIP-1694
        data: voteMetadata,
      },
    ],
  }
}

/**
 * Create voter from credential
 */
export function createVoter(
  type: 'drep' | 'pool' | 'committee',
  credential: string,
): Voter {
  return {
    type,
    credential,
  }
}

/**
 * Create voting procedure
 */
export function createVotingProcedure(
  vote: 'yes' | 'no' | 'abstain',
  anchor?: {url: string; hash: string},
): VotingProcedure {
  return {
    vote,
    anchor,
  }
}

/**
 * Validate vote
 */
export function validateVote(vote: Vote): {valid: boolean; error?: string} {
  if (!vote.voter || !vote.voter.credential) {
    return {valid: false, error: 'Valid voter is required'}
  }

  if (!vote.governanceActionId) {
    return {valid: false, error: 'Governance action ID is required'}
  }

  if (!vote.votingProcedure || !vote.votingProcedure.vote) {
    return {valid: false, error: 'Valid voting procedure is required'}
  }

  return {valid: true}
}
